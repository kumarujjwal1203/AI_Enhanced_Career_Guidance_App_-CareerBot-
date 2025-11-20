const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// MongoDB connection string - update this if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerbot';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema (same as in your models)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  name: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Admin credentials
    const adminEmail = 'admin@careerbot.com';
    const adminPassword = 'admin123'; // Change this to a secure password!
    
    console.log('\n🔐 Creating admin user...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('Updating to ensure admin privileges...');
      
      // Update existing user to be admin
      existingAdmin.isAdmin = true;
      existingAdmin.name = 'Admin User';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      
      console.log('✅ Existing user updated with admin privileges!');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Create new admin user
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        name: 'Admin User',
        phone: '1234567890',
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@careerbot.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🚀 You can now login to the admin panel at http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

// Run the script
createAdminUser();
