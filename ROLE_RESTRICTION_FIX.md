# Role Restriction Fix

This document explains the fix to remove restricted roles from the registration form.

## Issue Identified
The registration form was incorrectly allowing users to register as Admin, HR, Accountant, and Captain. According to the MarsaFyi specification, these roles are not available for general registration:
- Admin, HR, Accountant, and Captain roles are assigned by the Captain
- Only Seller, Buyer, Surveyor, Insurance Agent, Transporter, Logistics, and CHA roles are available for direct registration

## Fix Implemented

### Client-Side (Register Component)
1. **Removed Restricted Roles** from workClasses array:
   - Removed Admin role
   - Removed HR role
   - Removed Accountant role
   - Removed Captain role

2. **Updated Work Classes Array**:
   - Only 7 roles remain: Seller, Buyer, Surveyor, Insurance Agent, Transporter, Logistics, CHA
   - All roles have appropriate icons

3. **Updated Helper Functions**:
   - getRoleName() - Removed Admin and HR mappings
   - getDocumentInstructions() - Removed Admin and HR instructions

### Server-Side
The server-side validation was already correctly implemented to only accept valid roles, so no changes were needed there.

## Files Modified

1. `client/src/components/Register.js` - Removed restricted roles from registration form

## Compliance with Specification

### Roles Available for Registration (as per specification):
- ✅ Seller
- ✅ Buyer
- ✅ Surveyor
- ✅ Insurance Agent
- ✅ Transporter
- ✅ Logistics
- ✅ CHA

### Roles NOT Available for Registration (as per specification):
- ❌ Admin (assigned by Captain)
- ❌ HR (assigned by Captain)
- ❌ Accountant (assigned by Captain)
- ❌ Captain (only one Captain exists)

## Testing

To verify the fix:
1. Navigate to http://localhost:3000/register
2. Proceed to Step 2 (Work Class Selection)
3. Verify that only 7 role options are available:
   - Seller
   - Buyer
   - Surveyor
   - Insurance Agent
   - Transporter
   - Logistics
   - CHA
4. Verify that Admin, HR, Accountant, and Captain options are NOT available

## Notes

1. The Captain assigns role codes to Admin, HR, and Accountant users
2. There is only one Captain in the entire application
3. General users can only register for the 7 business roles listed above
4. This fix ensures compliance with the MarsaFyi Application Flow specification

The registration form now correctly restricts role selection to only those roles that are available for general registration, as specified in the original requirements.