# Vendor Code Format Fix

This document explains the fix to correct the vendor code format generation according to the MarsaFyi specification.

## Issue Identified
The vendor code was being generated as `USER-25-OFY24N` instead of using the correct role prefix. According to the specification, the vendor code should follow the format:
"Initial of role selected - last two digits of current year - six digits and alphanumeric mix unique code"

For an Insurance Agent registration, it should be `INS-25-XXXXXX` instead of `USER-25-XXXXXX`.

## Root Cause
The server-side `generateVendorCode` function was using `USER` as the default prefix when a role wasn't found in the rolePrefixes map, instead of properly mapping all the available roles.

## Fix Implemented

### Server-Side (generateVendorCode Function)
1. **Updated Role Prefixes Map** to include all valid roles:
   - seller: SELL
   - buyer: BUY
   - captain: CAPT
   - admin: ADM
   - hr: HR
   - accountant: ACC
   - arbitrator: ARB
   - surveyor: SUR
   - insurance: INS
   - transporter: TRN
   - logistics: LOG
   - cha: CHA

2. **Maintained Proper Default**:
   - Still uses 'USER' as fallback for unrecognized roles
   - But all valid registration roles are now properly mapped

## Files Modified

1. `server/server.js` - Updated generateVendorCode function

## Correct Vendor Code Format (as per specification)
The vendor code now correctly follows the format:
- Role Prefix - YY - XXXXXX
- Where YY = Last two digits of current year
- Where XXXXXX = 6-character alphanumeric unique code

## Examples of Correct Vendor Codes
- Insurance Agent: INS-25-A1B2C3
- Seller: SELL-25-D4E5F6
- Buyer: BUY-25-G7H8I9
- Surveyor: SUR-25-J1K2L3
- etc.

## Testing

To verify the fix:
1. Register as an Insurance Agent
2. Check that the vendor code starts with "INS-" followed by the year and unique code
3. Register as other roles and verify their correct prefixes:
   - Seller: SELL-
   - Buyer: BUY-
   - Surveyor: SUR-
   - Insurance Agent: INS-
   - Transporter: TRN-
   - Logistics: LOG-
   - CHA: CHA-

## Compliance with Specification

The vendor code generation now correctly follows the MarsaFyi Application Flow specification:
- ✅ Role prefix based on selected work class
- ✅ Last two digits of current year
- ✅ Six digits and alphanumeric mix unique code
- ✅ Proper format: PREFIX-YY-XXXXXX

The vendor code generation now properly reflects the user's selected role in the code format, making it easier to identify user roles at a glance.