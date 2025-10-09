// Script to add the "Land, house flat plot category" to Supabase
// Run this script with: node add_land_category.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in your environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addLandCategory() {
  try {
    console.log('Checking if "Land, house flat plot category" already exists...');
    
    // Check if the category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', 'Land, house flat plot category')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing category:', checkError.message);
      return;
    }

    if (existingCategory) {
      console.log('Category already exists. Updating description...');
      
      // Update the existing category description
      const { data, error: updateError } = await supabase
        .from('categories')
        .update({ 
          description: 'Land, houses, flats, and plots for sale or rent - Featured Category'
        })
        .eq('id', existingCategory.id);

      if (updateError) {
        console.error('Error updating category:', updateError.message);
        return;
      }

      console.log('Category description updated successfully');
    } else {
      console.log('Adding new "Land, house flat plot category"...');
      
      // Insert the new category
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([
          {
            name: 'Land, house flat plot category',
            description: 'Land, houses, flats, and plots for sale or rent - Featured Category'
          }
        ]);

      if (insertError) {
        console.error('Error inserting category:', insertError.message);
        return;
      }

      console.log('New category added successfully');
    }

    // Verify the category was added/updated
    const { data: verificationData, error: verificationError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', 'Land, house flat plot category');

    if (verificationError) {
      console.error('Error verifying category:', verificationError.message);
      return;
    }

    console.log('Category verification:', verificationData[0]);

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the function
addLandCategory();