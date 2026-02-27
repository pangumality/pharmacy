const express = require('express')
const fs = require('fs')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const path = require('path')
require('dotenv').config()
cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port = process.env.PORT || 3001
const fileUpload = require("express-fileupload")
const jwt = require("jsonwebtoken")
const axios = require('axios');

const prisma = new PrismaClient()

app.use(fileUpload());

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use("/uploads", express.static(uploadsDir))

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' })
}

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: email }],
      },
    })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const storedPassword = user.password || ""
    const isBcryptHash = typeof storedPassword === "string" && storedPassword.startsWith("$2")
    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed" })
  }
});

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const baseUsername = String(username || normalizedEmail.split("@")[0] || "user")
      .trim()
      .replace(/\s+/g, "-")

    const existingByEmail = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (existingByEmail) {
      return res.status(400).json({ message: "User already exists" })
    }

    let finalUsername = baseUsername || "user"
    for (let attempt = 0; attempt < 10; attempt++) {
      const existingByUsername = await prisma.user.findFirst({ where: { username: finalUsername } })
      if (!existingByUsername) break
      const suffix = Math.floor(1000 + Math.random() * 9000)
      finalUsername = `${baseUsername}-${suffix}`
    }

    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        username: finalUsername,
        email: normalizedEmail,
        password: passwordHash,
        role: "user",
      },
    })

    res.status(201).json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Registration failed" })
  }
});

app.post("/api/upload/multiple", async (req, res) => {
  if (!req.files || !req.files.images) {
    return res.status(400).json({ msg: "No files uploaded" });
  }

  const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
  const imageUrls = [];

  try {
    for (const file of files) {
      const UFileName = `${new Date().getTime()}-${file.name.replaceAll(" ", "-")}`;
      const uploadPath = path.join(uploadsDir, UFileName);
      
      await file.mv(uploadPath);
      imageUrls.push(`/uploads/${UFileName}`);
    }
    
    res.json({ imageUrls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "File upload failed", error: err.message });
  }
});

// Delete uploaded image endpoint
app.delete("/api/upload/:filename", async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "Image deleted successfully" });
    } else {
      // If file doesn't exist, we can still consider it a success as it's gone
      res.json({ message: "Image not found, but deletion considered successful" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { productname, name, price, quantity, description, image, category } = req.body;
    
    // Allow either productname or name
    const finalName = productname || name;

    if (!finalName || !price || !quantity || !description) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    let imagePath = image;

    if (req.files && req.files.file) {
      const file = req.files.file;
      const UFileName = `${new Date().getTime()}-${file.name.replaceAll(" ", "-")}`;
      const uploadPath = path.join(uploadsDir, UFileName);
      
      await file.mv(uploadPath);
      imagePath = `/uploads/${UFileName}`;
    }

    const product = await prisma.product.create({
      data: {
        name: finalName,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        description: description,
        image: imagePath,
        category: category || "Uncategorized"
      }
    });
    res.json({ msg: "Product added successfully", fileName: imagePath, product });
  } catch (error) {
    console.error("Database Insert Error: ", error);
    res.status(500).json({ msg: "Database error" });
  }
});

// Get all products with pagination and filtering
app.get("/api/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Default to 100 to show more products
    const skip = (page - 1) * limit;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const where = {};
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ];
    }
    if (category && category !== "All") {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get featured products (top 3)
app.get("/api/products/featured", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ error: "Failed to fetch featured products" });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, description, image, category } = req.body;
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
        image,
        category
      }
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    // Find product to get image path
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete from database
    await prisma.product.delete({
      where: { id: productId }
    });

    // Delete image file if it exists and is in uploads folder
    if (product.image && product.image.startsWith('/uploads/')) {
      const filename = product.image.replace('/uploads/', '');
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error deleting image file:", err);
        }
      }
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
}

const admin = (req, res, next) => {
  if (req.user && typeof req.user.role === "string" && req.user.role.toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
}

app.get("/api/users/profile", protect, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  })
});

app.put("/api/users/profile", protect, async (req, res) => {
  try {
    const { name, username, email, password } = req.body

    const data = {}
    if (name !== undefined) data.name = String(name).trim()
    if (username !== undefined) data.username = String(username).trim()
    if (email !== undefined) data.email = String(email).trim().toLowerCase()
    if (password) data.password = await bcrypt.hash(String(password), 10)

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
    })

    res.json({
      id: updated.id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      token: generateToken(updated.id),
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Failed to update profile" })
  }
});

app.get("/api/users/stats", protect, admin, async (req, res) => {
  try {
    const [totalUsers, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { equals: "admin", mode: "insensitive" } } }),
    ])

    res.json({
      totalUsers,
      totalAdmins,
      totalCustomers: totalUsers - totalAdmins,
    })
  } catch (error) {
    console.error("User stats error:", error)
    res.status(500).json({ message: "Failed to fetch user stats" })
  }
});

app.get("/api/users", protect, admin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Failed to fetch users" })
  }
});

app.get("/api/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Failed to fetch user" })
  }
});

app.put("/api/users/:id", protect, admin, async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body

    const data = {}
    if (name !== undefined) data.name = String(name).trim()
    if (username !== undefined) data.username = String(username).trim()
    if (email !== undefined) data.email = String(email).trim().toLowerCase()
    if (role !== undefined) data.role = String(role).trim()
    if (password) data.password = await bcrypt.hash(String(password), 10)

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Failed to update user" })
  }
});

app.delete("/api/users/:id", protect, admin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: "User deleted" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ message: "Failed to delete user" })
  }
});

app.get("/api/payment/verify/:reference", protect, async (req, res) => {
  try {
    const reference = String(req.params.reference || "").trim()
    if (!reference) {
      return res.status(400).json({ status: false, message: "Reference is required" })
    }

    const apiToken =
      process.env.LENCO_API_TOKEN ||
      process.env.LENCO_SECRET_KEY ||
      process.env.LENCO_API_KEY ||
      ""

    if (!apiToken) {
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          status: true,
          message: "Verification skipped (LENCO API token not configured)",
          data: { reference, skipped: true },
        })
      }
      return res.status(500).json({ status: false, message: "Payment verification not configured" })
    }

    const baseUrl =
      process.env.LENCO_ACCESS_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api.lenco.co/access/v1"
        : "https://sandbox.lenco.co/access/v1")

    const url = `${baseUrl}/point-of-sale/transactions/by-reference/${encodeURIComponent(reference)}`
    const lencoResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      timeout: 15000,
    })

    const payload = lencoResponse?.data
    const transaction = payload?.data?.transaction
    const isSuccessful = transaction?.status === "successful"

    return res.json({
      status: Boolean(isSuccessful),
      message: isSuccessful ? "Verification successful" : payload?.message || "Verification failed",
      data: {
        reference,
        transaction,
        raw: payload,
      },
    })
  } catch (error) {
    const statusCode = error?.response?.status || 500
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Payment verification failed"

    console.error("Payment verification error:", message)
    return res.status(statusCode).json({ status: false, message })
  }
})

const toClientOrder = (order) => {
  if (!order) return order
  const orderItems = Array.isArray(order.orderItems)
    ? order.orderItems.map((item) => ({
        ...item,
        quantity: item.qty,
      }))
    : order.orderItems

  const derivedStatus = order.isDelivered
    ? "Delivered"
    : order.isPaid
      ? "Processing"
      : "Pending"

  return {
    ...order,
    _id: String(order.id),
    orderItems,
    totalAmount: order.totalPrice,
    taxAmount: order.taxPrice,
    shippingAmount: order.shippingPrice,
    status: order.status || derivedStatus,
  }
}

const allowedOrderStatuses = new Set([
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
])

app.get("/api/orders/stats/check", protect, admin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.totalPrice), 0);
    const paidOrders = orders.filter((order) => order.isPaid).length;
    const unpaidOrders = totalOrders - paidOrders;

    res.json({
      totalOrders,
      totalSales,
      paidOrders,
      unpaidOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
});

app.get("/api/orders/myorders", protect, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        orderItems: true,
      }
    });
    res.json(orders.map(toClientOrder));
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

app.get("/api/orders", protect, admin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: true,
      },
    });
    res.json(orders.map(toClientOrder));
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders", error: error.message });
  }
});

app.post("/api/orders", protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentResult,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    } else {
      const normalizedItems = (orderItems || []).map((item) => {
        const productIdRaw = item.product ?? item.productId ?? item.id
        const productId = parseInt(String(productIdRaw), 10)
        return {
          name: item.name,
          qty: item.qty ?? item.quantity ?? 0,
          image: item.image,
          price: item.price,
          productId,
        }
      })

      const invalid = normalizedItems.find((i) => !i.productId || Number.isNaN(i.productId) || !i.qty)
      if (invalid) {
        return res.status(400).json({ message: "Invalid order items" })
      }

      const computedItemsPrice = normalizedItems.reduce(
        (acc, i) => acc + Number(i.price) * Number(i.qty),
        0
      )

      const finalItemsPrice = Number(itemsPrice ?? computedItemsPrice)
      const finalTaxPrice = Number(taxPrice ?? taxAmount ?? 0)
      const finalShippingPrice = Number(shippingPrice ?? shippingAmount ?? 0)
      const finalTotalPrice = Number(
        totalPrice ??
          totalAmount ??
          (finalItemsPrice + finalTaxPrice + finalShippingPrice)
      )

      const order = await prisma.order.create({
        data: {
          orderItems: {
            create: normalizedItems.map((item) => ({
              name: item.name,
              qty: item.qty,
              image: item.image,
              price: item.price,
              product: {
                connect: {
                  id: item.productId,
                },
              },
            })),
          },
          user: {
            connect: {
              id: req.user.id,
            },
          },
          shippingAddress,
          paymentMethod,
          paymentResult: paymentResult || null,
          itemsPrice: finalItemsPrice,
          taxPrice: finalTaxPrice,
          shippingPrice: finalShippingPrice,
          totalPrice: finalTotalPrice,
          isPaid: Boolean(paymentResult),
          paidAt: paymentResult ? new Date() : null,
          status: paymentResult ? "Processing" : "Pending",
        },
        include: {
          orderItems: true,
        }
      });

      res.status(201).json(toClientOrder(order));
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Order creation failed", error: error.message });
  }
});

app.get("/api/orders/:id", protect, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        user: true,
        orderItems: true,
      },
    });

    if (order) {
      res.json(toClientOrder(order));
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
});

app.put("/api/orders/:id/pay", protect, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: "Invalid order id" })

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return res.status(404).json({ message: "Order not found" })

    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this order" })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: req.body || null,
        status: order.status === "Pending" ? "Processing" : order.status,
      },
      include: { user: true, orderItems: true },
    })

    return res.json(toClientOrder(updated))
  } catch (error) {
    res.status(500).json({ message: "Failed to update payment status", error: error.message })
  }
})

app.put("/api/orders/:id/deliver", protect, admin, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: "Invalid order id" })

    const updated = await prisma.order.update({
      where: { id },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
        status: "Delivered",
      },
      include: { user: true, orderItems: true },
    })

    return res.json(toClientOrder(updated))
  } catch (error) {
    res.status(500).json({ message: "Failed to update delivery status", error: error.message })
  }
})

app.put("/api/orders/:id/status", protect, admin, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: "Invalid order id" })

    const status = String(req.body?.status || "").trim()
    if (!allowedOrderStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const data = { status }
    if (status === "Delivered") {
      data.isDelivered = true
      data.deliveredAt = new Date()
    } else if (status === "Shipped" || status === "Processing" || status === "Pending" || status === "Cancelled") {
      data.isDelivered = false
      data.deliveredAt = null
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: { user: true, orderItems: true },
    })

    return res.json(toClientOrder(updated))
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message })
  }
})

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
