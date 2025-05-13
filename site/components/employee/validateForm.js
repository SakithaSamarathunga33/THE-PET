// This is a temporary file to be used as a reference for the validateForm function

const validateForm = (formData) => {
  const errors = {
    name: '',
    email: '',
    phoneNumber: '',
    baseSalary: '',
    hourlyRate: '',
    address: '',
    role: '',
    status: '',
    workingHoursPerDay: ''
  };
  
  // Name validation
  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (formData.name.trim().length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
    errors.name = 'Name can only contain letters, spaces and characters (\' . -)';
  }
  
  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone number validation
  if (!formData.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = 'Phone number must be between 10-15 digits';
  }
  
  // Base salary validation
  if (!formData.baseSalary) {
    errors.baseSalary = 'Base salary is required';
  } else if (isNaN(formData.baseSalary) || Number(formData.baseSalary) <= 0) {
    errors.baseSalary = 'Please enter a valid base salary';
  } else if (Number(formData.baseSalary) > 1000000) {
    errors.baseSalary = 'Base salary cannot exceed 1,000,000';
  }
  
  // Hourly rate validation
  if (!formData.hourlyRate) {
    errors.hourlyRate = 'Hourly rate is required';
  } else if (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) <= 0) {
    errors.hourlyRate = 'Please enter a valid hourly rate';
  } else if (Number(formData.hourlyRate) > 10000) {
    errors.hourlyRate = 'Hourly rate cannot exceed 10,000';
  }
  
  // Working hours validation
  if (!formData.workingHoursPerDay) {
    errors.workingHoursPerDay = 'Working hours is required';
  } else if (isNaN(formData.workingHoursPerDay) || Number(formData.workingHoursPerDay) < 1) {
    errors.workingHoursPerDay = 'Working hours must be at least 1';
  } else if (Number(formData.workingHoursPerDay) > 24) {
    errors.workingHoursPerDay = 'Working hours cannot exceed 24 per day';
  }
  
  // Address validation
  if (!formData.address.trim()) {
    errors.address = 'Address is required';
  } else if (formData.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  } else if (formData.address.trim().length > 200) {
    errors.address = 'Address cannot exceed 200 characters';
  }
  
  // Role validation
  if (!formData.role) {
    errors.role = 'Please select a role';
  }
  
  // Status validation
  if (!formData.status) {
    errors.status = 'Please select a status';
  }
  
  return errors;
};

export default validateForm;
