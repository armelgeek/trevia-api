import type { User } from '../../domain/models/user.model'

export const mockUserProfile: User = {
  id: 'USER-2024-001',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@email.com',
  phone: '06 12 34 56 78',
  birthDate: '1985-03-15',
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    zipCode: '75001',
    country: 'France'
  },
  memberSince: '2022-01-15',
  totalTrips: 42,
  totalSpent: 1580,
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    twoFactorAuth: true
  }
}
