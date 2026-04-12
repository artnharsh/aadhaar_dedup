// Sample Aadhaar-like records with intentional duplicates for demonstration
export const SAMPLE_RECORDS = [
  { id: 'R001', name: 'Rajesh Kumar', dob: '1985-03-15', address: '42 Gandhi Nagar, Pune, Maharashtra', phone: '9876543210', email: 'rajesh.kumar@email.com' },
  { id: 'R002', name: 'Priya Sharma', dob: '1990-07-22', address: '15 Nehru Colony, Mumbai, Maharashtra', phone: '9845671234', email: 'priya.sharma@gmail.com' },
  { id: 'R003', name: 'Rajesh Kumarr', dob: '1985-03-15', address: '42 Gandhi Nagar, Pune, MH', phone: '9876543210', email: 'rajesh.k@email.com' }, // Dup of R001
  { id: 'R004', name: 'Arun Patel', dob: '1978-11-30', address: '8 Subhash Road, Ahmedabad, Gujarat', phone: '9712345678', email: 'arun.patel@yahoo.com' },
  { id: 'R005', name: 'Priya Sharma', dob: '1990-07-22', address: '15 Nehru Colony, Mumbai, Maharashtra', phone: '9845671234', email: 'priya.sharma@gmail.com' }, // Dup of R002
  { id: 'R006', name: 'Meena Iyer', dob: '1995-01-08', address: '23 TTK Road, Chennai, Tamil Nadu', phone: '9600123456', email: 'meena.iyer@hotmail.com' },
  { id: 'R007', name: 'Suresh Reddy', dob: '1982-06-14', address: '5 Film Nagar, Hyderabad, Telangana', phone: '9390456789', email: 'suresh.reddy@email.com' },
  { id: 'R008', name: 'Aroon Patell', dob: '1978-11-30', address: '8 Subhash Rd, Ahmedabad, GJ', phone: '9712345678', email: 'a.patel@yahoo.com' }, // Dup of R004
  { id: 'R009', name: 'Kavitha Nair', dob: '1988-09-03', address: '77 MG Road, Kochi, Kerala', phone: '9447890123', email: 'kavitha.nair@gmail.com' },
  { id: 'R010', name: 'Deepak Joshi', dob: '1975-12-25', address: '31 Rajpur Road, Dehradun, Uttarakhand', phone: '9412678901', email: 'deepak.joshi@email.com' },
  { id: 'R011', name: 'Meena Iyer', dob: '1995-01-08', address: '23 TTK Road, Chennai, TN', phone: '9600123456', email: 'meena.i@hotmail.com' }, // Dup of R006
  { id: 'R012', name: 'Sanjay Gupta', dob: '1983-04-19', address: '9 Karol Bagh, New Delhi', phone: '9810234567', email: 'sanjay.gupta@gmail.com' },
  { id: 'R013', name: 'Anitha Krishnan', dob: '1993-08-27', address: '14 Anna Nagar, Chennai, Tamil Nadu', phone: '9841345678', email: 'anitha.k@email.com' },
  { id: 'R014', name: 'Deepak Joshi', dob: '1975-12-25', address: '31 Rajpur Rd, Dehradun', phone: '9412678901', email: 'djoshi@email.com' }, // Dup of R010
  { id: 'R015', name: 'Rohit Singh', dob: '1989-02-11', address: '62 Hazratganj, Lucknow, UP', phone: '9956789012', email: 'rohit.singh@yahoo.com' },
  { id: 'R016', name: 'Fatima Shaikh', dob: '1991-05-16', address: '3 Dongri, Mumbai, Maharashtra', phone: '9833456789', email: 'fatima.shaikh@gmail.com' },
  { id: 'R017', name: 'Rohit Singh', dob: '1989-02-11', address: '62 Hazratganj, Lucknow, Uttar Pradesh', phone: '9956789012', email: 'rohit.s@yahoo.com' }, // Dup of R015
  { id: 'R018', name: 'Vikram Mehta', dob: '1980-10-07', address: '47 C-Scheme, Jaipur, Rajasthan', phone: '9829567890', email: 'vikram.mehta@email.com' },
];

export const CSV_TEMPLATE = `name,dob,address,phone,email
John Doe,1990-01-15,"123 Main St, City",9999999999,john@email.com
Jane Doe,1990-01-15,"123 Main St, City",9999999999,jane@email.com`;
