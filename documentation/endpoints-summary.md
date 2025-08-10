# Résumé des Endpoints API Trevia

Ce document liste les principaux endpoints exposés par l'API, avec leur méthode, chemin, paramètres, body et description.

---

## Réservations (`/api/bookings`)

### Lister les réservations de l'utilisateur
- **GET** `/api/bookings`
  - Query: `page`, `limit`
  - Auth: Oui
  - Description: Liste paginée des réservations de l'utilisateur

### Détail d'une réservation
- **GET** `/api/bookings/{id}`
  - Path: `id` (string)
  - Auth: Oui
  - Description: Détail d'une réservation

### Créer une réservation
- **POST** `/api/reservation`
  - Body: `{ tripId: string, seatIds: string[], scheduleId: string }`
  - Auth: Oui
  - Description: Créer une réservation et générer un lien de paiement

### Mettre à jour une réservation
- **PUT** `/api/bookings/{id}`
  - Path: `id` (string)
  - Body: `{ seatIds?: string[], options?: [{ optionId: string, quantity: number }] }`
  - Auth: Oui
  - Description: Modifier les sièges ou options d'une réservation

### Annuler une réservation
- **DELETE** `/api/bookings/{id}`
  - Path: `id` (string)
  - Auth: Oui
  - Description: Annuler une réservation

---

## Paiements (`/api/bookings/{id}/payments`)

### Effectuer un paiement
- **POST** `/api/bookings/{id}/payments`
  - Path: `id` (string)
  - Body: `{ amount: string, paymentMethod: string }`
  - Auth: Oui
  - Description: Payer une réservation

### Historique des paiements
- **GET** `/api/bookings/{id}/payments`
  - Path: `id` (string)
  - Auth: Oui
  - Description: Liste des paiements pour une réservation

---

## Voyages (`/api/trips`)

### Lister les voyages
- **GET** `/api/trips`
  - Query: `page`, `limit`, `sort`, `filter`
  - Description: Liste paginée des voyages

### Détail d'un voyage
- **GET** `/api/trips/{id}`
  - Path: `id` (string)
  - Description: Détail d'un voyage

### Plan des places d'un voyage
- **GET** `/api/trips/{id}/seats`
  - Path: `id` (string)
  - Query: `scheduleId` (optionnel)
  - Description: Plan des places pour un voyage

---

## Horaires (`/api/schedules/{scheduleId}/seats`)

### Plan des places pour un horaire
- **GET** `/api/schedules/{scheduleId}/seats`
  - Path: `scheduleId` (string)
  - Description: Plan des places pour un horaire

---

## Routes (`/api/routes`)

### Lister les routes
- **GET** `/api/routes`
  - Query: `page`, `limit`, `sort`, `filter`
  - Description: Liste paginée des routes

### Détail d'une route
- **GET** `/api/routes/{id}`
  - Path: `id` (string)
  - Description: Détail d'une route

### Horaires d'une route
- **GET** `/api/routes/{id}/schedules`
  - Path: `id` (string)
  - Query: `date_start`, `date_end` (optionnels)
  - Description: Liste des horaires pour une route

---

## Véhicules (`/api/vehicles`)

### Lister les véhicules (admin)
- **GET** `/api/vehicles`
  - Query: `page`, `limit`, `sort`, `filter`
  - Auth: Admin
  - Description: Liste paginée des véhicules

### Détail d'un véhicule (admin)
- **GET** `/api/vehicles/{id}`
  - Path: `id` (string)
  - Auth: Admin
  - Description: Détail d'un véhicule

### Créer un véhicule (admin)
- **POST** `/api/vehicles`
  - Body: `{ ... }` (voir schéma)
  - Auth: Admin
  - Description: Créer un véhicule

### Mettre à jour un véhicule (admin)
- **PUT** `/api/vehicles/{id}`
  - Path: `id` (string)
  - Body: `{ ... }` (voir schéma)
  - Auth: Admin
  - Description: Mettre à jour un véhicule

---

## Tarifs (`/api/pricing`)

### Obtenir les tarifs
- **GET** `/api/pricing`
  - Query: `departureCity`, `arrivalCity`
  - Description: Liste des tarifs et horaires disponibles

---

## Localisations (`/api/locations`)

### Villes de départ
- **GET** `/api/locations/departure-cities`
  - Description: Liste des villes de départ

### Destinations
- **GET** `/api/locations/destinations`
  - Query: `city`
  - Description: Liste des destinations depuis une ville

---

## Statut de paiement (`/api/payment-status`)

### Obtenir le statut de paiement
- **GET** `/api/payment-status`
  - Query: `bookingId`
  - Description: Statut de paiement pour une réservation

---

## Options (`/api/options`)

### Lister les options
- **GET** `/api/options`
  - Description: Liste des options disponibles

---

## Admin (`/api/admin`)

### Dashboard
- **GET** `/api/admin/dashboard`
  - Auth: Admin
  - Description: Statistiques et alertes admin

### Lister toutes les réservations
- **GET** `/api/admin/bookings`
  - Query: `page`, `limit`
  - Auth: Admin
  - Description: Liste paginée de toutes les réservations

### Lister tous les voyages
- **GET** `/api/admin/trips`
  - Query: `page`, `limit`
  - Auth: Admin
  - Description: Liste paginée de tous les voyages

---

## Permissions & Rôles (`/api/v1/roles`)

### Créer un rôle
- **POST** `/api/v1/roles`
  - Body: `{ name: string, description: string, permissions: [{ subject, actions[] }] }`
  - Auth: Oui (admin)
  - Description: Créer un nouveau rôle

### Assigner un rôle à un utilisateur
- **POST** `/api/v1/users/:userId/roles/:roleId`
  - Path: `userId`, `roleId` (UUID)
  - Auth: Oui (admin)
  - Description: Assigner un rôle à un utilisateur

### Détail des rôles
- **GET** `/api/v1/roles/details`
  - Auth: Oui (admin)
  - Description: Liste des rôles avec permissions et utilisateurs

### Modifier un rôle
- **PUT** `/api/v1/roles/{roleId}`
  - Path: `roleId` (UUID)
  - Body: `{ name?, description?, permissions? }`
  - Auth: Oui (admin)
  - Description: Modifier un rôle

### Supprimer un rôle
- **DELETE** `/api/v1/roles/{roleId}`
  - Path: `roleId` (UUID)
  - Auth: Oui (admin)
  - Description: Supprimer un rôle

---

## Webhooks

### Stripe Webhook
- **POST** `/api/stripe/webhook`
  - Body: Stripe payload
  - Description: Gérer les événements Stripe

### Retry paiement
- **POST** `/api/retry-payment`
  - Body: `{ bookingId: string }`
  - Description: Recréer une session de paiement Stripe

### Annuler un voyage et rembourser
- **POST** `/api/cancel-trip`
  - Body: `{ bookingId: string }`
  - Description: Annuler un voyage et demander un remboursement

---

> Pour plus de détails sur les schémas de body et de réponse, voir la documentation OpenAPI `/swagger` ou `/docs`.
