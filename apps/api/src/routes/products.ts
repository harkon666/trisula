import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, products } from '@repo/database';
import { eq, desc } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';

const productsRoute = new Hono<{ Variables: { user: AuthUser } }>();

// Schemas
const CreateProductSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    pointsReward: z.number().int().nonnegative(),
    mediaUrl: z.string().url().optional(),
    isActive: z.boolean().optional().default(true),
});

const UpdateProductSchema = CreateProductSchema.partial();

/**
 * @route   GET /api/v1/products
 * @desc    List all active products
 * @access  Public
 */
productsRoute.get('/', async (c) => {
    try {
        const items = await db.select()
            .from(products)
            .where(eq(products.isActive, true))
            .orderBy(desc(products.id)); // Newest first

        return c.json({ success: true, data: items });
    } catch (error) {
        console.error("Fetch Products Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Admin Input, Super Admin
 */
productsRoute.post('/', rbacMiddleware(), zValidator('json', CreateProductSchema), async (c) => {
    const body = c.req.valid('json');

    try {
        const [newProduct] = await db.insert(products).values(body).returning();
        return c.json({ success: true, data: newProduct }, 201);
    } catch (error) {
        console.error("Create Product Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update product details
 * @access  Admin Input, Super Admin
 */
productsRoute.patch('/:id', rbacMiddleware(), zValidator('json', UpdateProductSchema), async (c) => {
    const id = parseInt(c.req.param('id'));
    const body = c.req.valid('json');

    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);

    try {
        const [updatedProduct] = await db.update(products)
            .set(body)
            .where(eq(products.id, id))
            .returning();

        if (!updatedProduct) {
            return c.json({ success: false, message: "Product not found" }, 404);
        }

        return c.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Update Product Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Soft delete product
 * @access  Super Admin (Strict?) -> Let's check RBAC
 *          RBAC Logic: Admin Input allows POST only? Admin View GET only.
 *          So DELETE is likely restricted to Super Admin or we need to update RBAC logic if we want partial allow.
 *          For now, rbacMiddleware defaults to blocking unknown roles/methods unless Super Admin.
 *          Wait, Admin Input is specific: if POST -> next. So DELETE will fall through to 'Forbidden' unless Super Admin.
 */
productsRoute.delete('/:id', rbacMiddleware(), async (c) => {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);

    try {
        // Soft Delete
        const [deleted] = await db.update(products)
            .set({ isActive: false })
            .where(eq(products.id, id))
            .returning();

        if (!deleted) {
            return c.json({ success: false, message: "Product not found" }, 404);
        }

        return c.json({ success: true, message: "Product deleted (soft)" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default productsRoute;
