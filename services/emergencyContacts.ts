// Emergency Contacts Service for Pregnancy Assistant

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary?: boolean;
}

const defaultEmergencyContacts: EmergencyContact[] = [
  {
    id: 'partner',
    name: 'Partner',
    relationship: 'Partner/Spouse',
    phoneNumber: '+254701343452',
    isPrimary: true,
  },
  {
    id: 'doctor',
    name: 'OB/GYN',
    relationship: 'Doctor',
    phoneNumber: '+254701343452',
  },
  {
    id: 'emergency',
    name: 'Emergency Services',
    relationship: 'Emergency',
    phoneNumber: '911',
    isPrimary: true,
  },
  {
    id: 'family',
    name: 'Family Member',
    relationship: 'Family',
    phoneNumber: '+254701343452',
  },
];

// Get emergency contacts from localStorage or return defaults
export function getEmergencyContacts(): EmergencyContact[] {
  try {
    const stored = localStorage.getItem('emergency_contacts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading emergency contacts:', error);
  }
  return defaultEmergencyContacts;
}

// Save emergency contacts to localStorage
export function saveEmergencyContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
  }
}

// Add or update an emergency contact
export function updateEmergencyContact(contact: EmergencyContact): void {
  const contacts = getEmergencyContacts();
  const index = contacts.findIndex(c => c.id === contact.id);
  
  if (index >= 0) {
    contacts[index] = contact;
  } else {
    contacts.push(contact);
  }
  
  saveEmergencyContacts(contacts);
}

// Make a phone call (opens tel: link)
export function makeCall(phoneNumber: string): void {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }
  
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
  
  // Open tel: link to initiate call
  window.location.href = `tel:${cleanNumber}`;
}

// Get primary emergency contacts
export function getPrimaryContacts(): EmergencyContact[] {
  return getEmergencyContacts().filter(c => c.isPrimary && c.phoneNumber);
}

// Get a specific contact by relationship
export function getContactByRelationship(relationship: string): EmergencyContact | undefined {
  const contacts = getEmergencyContacts();
  return contacts.find(c => 
    c.relationship.toLowerCase().includes(relationship.toLowerCase()) && 
    c.phoneNumber
  );
}

// Format phone number for display
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber;
}
