// Password validation functions for the registration process
// This file contains functions to validate and hash passwords according to your requirements

const bcrypt = require('bcrypt');

// Password validation function
function validatePassword(password) {
    // Check if password meets requirements:
    // - At least 8 characters
    // - Contains at least one uppercase letter
    // - Contains at least one special character
    // - Contains at least one digit
    
    const errors = [];
    
    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one digit');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Hash password function
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Compare password function
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Example usage in registration endpoint:
/*
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, workClass } = req.body;
        
        // Validate required fields
        if (!email || !password || !firstName || !lastName || !phone || !workClass) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }
        
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password does not meet requirements: ' + passwordValidation.errors.join(', ')
            });
        }
        
        // Hash the password
        const hashedPassword = await hashPassword(password);
        
        // Continue with user registration using hashedPassword instead of plain text password
        // ... rest of registration logic
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});
*/

module.exports = {
    validatePassword,
    hashPassword,
    comparePassword
};