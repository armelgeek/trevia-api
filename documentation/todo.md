# TODO-list API – Génération automatisée

## Tâches Admin (prioritaires)

- [ ] **Dashboard admin** (`GET /api/admin/dashboard`)
  - Use case : Accès aux statistiques et alertes pour l’admin
  - Scénario nominal :
    1. L’admin accède au dashboard
    2. Les statistiques et alertes sont affichées
  - Scénarios d’exception :
    - Accès non autorisé
  - Critères d’acceptation :
    - Les données sont correctes et à jour
  - Paramètres : header (Authorization)

- [ ] **Lister toutes les réservations** (`GET /api/admin/bookings`)
  - Use case : Consultation de toutes les réservations (admin)
  - Scénario nominal :
    1. L’admin consulte la liste paginée
  - Scénarios d’exception :
    - Accès non autorisé
  - Critères d’acceptation :
    - Liste paginée retournée
  - Paramètres : query (page, limit), header (Authorization)

- [ ] **Lister tous les voyages** (`GET /api/admin/trips`)
  - Use case : Consultation de tous les voyages (admin)
  - Scénario nominal :
    1. L’admin consulte la liste paginée
  - Scénarios d’exception :
    - Accès non autorisé
  - Critères d’acceptation :
    - Liste paginée retournée
  - Paramètres : query (page, limit), header (Authorization)

- [ ] **Gestion des véhicules**
  - [ ] Lister les véhicules (`GET /api/vehicles`)
    - Use case : Consultation des véhicules (admin)
    - Scénario nominal :
      1. L’admin consulte la liste paginée
    - Scénarios d’exception :
      - Accès non autorisé
    - Critères d’acceptation :
      - Liste paginée retournée
    - Paramètres : query (page, limit, sort, filter), header (Authorization)
  - [ ] Détail d’un véhicule (`GET /api/vehicles/{id}`)
    - Use case : Voir le détail d’un véhicule (admin)
    - Scénario nominal :
      1. L’admin consulte le détail
    - Scénarios d’exception :
      - Véhicule non trouvé
    - Critères d’acceptation :
      - Détail correct affiché
    - Paramètres : path (id), header (Authorization)
  - [ ] Créer un véhicule (`POST /api/vehicles`)
    - Use case : Ajouter un véhicule (admin)
    - Scénario nominal :
      1. L’admin soumet le formulaire
      2. Le véhicule est créé
    - Scénarios d’exception :
      - Champs manquants
    - Critères d’acceptation :
      - Véhicule ajouté
    - Paramètres : body (voir schéma), header (Authorization)
  - [ ] Mettre à jour un véhicule (`PUT /api/vehicles/{id}`)
    - Use case : Modifier un véhicule (admin)
    - Scénario nominal :
      1. L’admin modifie les infos
      2. Les modifications sont enregistrées
    - Scénarios d’exception :
      - Véhicule non trouvé
    - Critères d’acceptation :
      - Modifications visibles
    - Paramètres : path (id), body (voir schéma), header (Authorization)

- [ ] **Gestion des rôles et permissions**
  - [ ] Créer un rôle (`POST /api/v1/roles`)
    - Use case : Création d’un rôle admin
    - Scénario nominal :
      1. L’admin crée un rôle
    - Scénarios d’exception :
      - Nom déjà utilisé
    - Critères d’acceptation :
      - Rôle créé
    - Paramètres : body (name, description, permissions), header (Authorization)
  - [ ] Assigner un rôle (`POST /api/v1/users/:userId/roles/:roleId`)
    - Use case : Attribution d’un rôle à un utilisateur
    - Scénario nominal :
      1. L’admin assigne un rôle
    - Scénarios d’exception :
      - Utilisateur ou rôle non trouvé
    - Critères d’acceptation :
      - Rôle assigné
    - Paramètres : path (userId, roleId), header (Authorization)
  - [ ] Détail des rôles (`GET /api/v1/roles/details`)
    - Use case : Voir les rôles et permissions
    - Scénario nominal :
      1. L’admin consulte la liste
    - Scénarios d’exception :
      - Accès non autorisé
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : header (Authorization)
  - [ ] Modifier un rôle (`PUT /api/v1/roles/{roleId}`)
    - Use case : Modifier un rôle
    - Scénario nominal :
      1. L’admin modifie un rôle
    - Scénarios d’exception :
      - Rôle non trouvé
    - Critères d’acceptation :
      - Rôle modifié
    - Paramètres : path (roleId), body (name?, description?, permissions?), header (Authorization)
  - [ ] Supprimer un rôle (`DELETE /api/v1/roles/{roleId}`)
    - Use case : Suppression d’un rôle
    - Scénario nominal :
      1. L’admin supprime un rôle
    - Scénarios d’exception :
      - Rôle non trouvé
    - Critères d’acceptation :
      - Rôle supprimé
    - Paramètres : path (roleId), header (Authorization)

- [ ] **Gestion des conducteurs (drivers)**
  - [ ] Lister les conducteurs (`GET /api/drivers`)
    - Use case : Consultation des conducteurs (admin)
    - Scénario nominal :
      1. L’admin consulte la liste paginée
    - Scénarios d’exception :
      - Accès non autorisé
    - Critères d’acceptation :
      - Liste paginée retournée
    - Paramètres : query (page, limit, sort, filter), header (Authorization)
  - [ ] Détail d’un conducteur (`GET /api/drivers/{id}`)
    - Use case : Voir le détail d’un conducteur (admin)
    - Scénario nominal :
      1. L’admin consulte le détail
    - Scénarios d’exception :
      - Conducteur non trouvé
    - Critères d’acceptation :
      - Détail correct affiché
    - Paramètres : path (id), header (Authorization)
  - [ ] Créer un conducteur (`POST /api/drivers`)
    - Use case : Ajouter un conducteur (admin)
    - Scénario nominal :
      1. L’admin soumet le formulaire
      2. Le conducteur est créé
    - Scénarios d’exception :
      - Champs manquants
    - Critères d’acceptation :
      - Conducteur ajouté
    - Paramètres : body (voir schéma), header (Authorization)
    - **Schéma (body)** :
      ```json
      {
        "firstName": "string",
        "lastName": "string",
        "license": "string",
        "certifications": "string[]",
        "phone": "string",
        "status": "string"
      }
      ```
  - [ ] Mettre à jour un conducteur (`PUT /api/drivers/{id}`)
    - Use case : Modifier un conducteur (admin)
    - Scénario nominal :
      1. L’admin modifie les infos
      2. Les modifications sont enregistrées
    - Scénarios d’exception :
      - Conducteur non trouvé
    - Critères d’acceptation :
      - Modifications visibles
    - Paramètres : path (id), body (voir schéma), header (Authorization)
    - **Schéma (body)** :
      ```json
      {
        "firstName"?: "string",
        "lastName"?: "string",
        "license"?: "string",
        "certifications"?: "string[]",
        "phone"?: "string",
        "status"?: "string"
      }
      ```

- [ ] **Gestion des routes**
  - [ ] Lister les routes (`GET /api/routes`)
    - Use case : Consultation des routes (admin)
    - Scénario nominal :
      1. L’admin consulte la liste paginée
    - Scénarios d’exception :
      - Accès non autorisé
    - Critères d’acceptation :
      - Liste paginée retournée
    - Paramètres : query (page, limit, sort, filter), header (Authorization)
  - [ ] Détail d’une route (`GET /api/routes/{id}`)
    - Use case : Voir le détail d’une route (admin)
    - Scénario nominal :
      1. L’admin consulte le détail
    - Scénarios d’exception :
      - Route non trouvée
    - Critères d’acceptation :
      - Détail correct affiché
    - Paramètres : path (id), header (Authorization)
  - [ ] Créer une route (`POST /api/routes`)
    - Use case : Ajouter une route (admin)
    - Scénario nominal :
      1. L’admin soumet le formulaire
      2. La route est créée
    - Scénarios d’exception :
      - Champs manquants
    - Critères d’acceptation :
      - Route ajoutée
    - Paramètres : body (voir schéma), header (Authorization)
    - **Schéma (body)** :
      ```json
      {
        "departureCity": "string",
        "arrivalCity": "string",
        "distanceKm": "string",
        "duration": "string",
        "basePrice": "string",
        "routeType": "string",
        "status": "string"
      }
      ```
  - [ ] Mettre à jour une route (`PUT /api/routes/{id}`)
    - Use case : Modifier une route (admin)
    - Scénario nominal :
      1. L’admin modifie les infos
      2. Les modifications sont enregistrées
    - Scénarios d’exception :
      - Route non trouvée
    - Critères d’acceptation :
      - Modifications visibles
    - Paramètres : path (id), body (voir schéma), header (Authorization)
    - **Schéma (body)** :
      ```json
      {
        "departureCity"?: "string",
        "arrivalCity"?: "string",
        "distanceKm"?: "string",
        "duration"?: "string",
        "basePrice"?: "string",
        "routeType"?: "string",
        "status"?: "string"
      }
      ```

- [ ] **Gestion des horaires (schedules)**
  - [ ] Lister les horaires (`GET /api/schedules`)
    - Use case : Consultation des horaires d’un voyage (admin)
    - Scénario nominal :
      1. L’admin ou l’utilisateur consulte la liste paginée des horaires pour un voyage donné (`tripId` requis)
    - Scénarios d’exception :
      - Accès non autorisé
      - `tripId` manquant ou invalide
    - Critères d’acceptation :
      - Liste paginée retournée, filtrée par `tripId`
    - Paramètres : query (tripId, page, limit), header (Authorization)
  - [ ] Détail d’un horaire (`GET /api/schedules/{id}`)
    - Use case : Voir le détail d’un horaire
    - Scénario nominal :
      1. L’admin ou l’utilisateur consulte le détail d’un horaire
    - Scénarios d’exception :
      - Horaire non trouvé
    - Critères d’acceptation :
      - Détail correct affiché
    - Paramètres : path (id), header (Authorization)
  - [ ] Créer un horaire (`POST /api/schedules`)
    - Use case : Ajouter un horaire à un voyage
    - Scénario nominal :
      1. L’admin soumet le formulaire avec un `tripId` valide
      2. L’horaire est créé
    - Scénarios d’exception :
      - `tripId` manquant ou invalide
      - Champs obligatoires manquants
    - Critères d’acceptation :
      - Horaire ajouté
    - Paramètres : body (tripId, departureTime, arrivalTime, status, ...), header (Authorization)
    - Exemple de payload :
      ```json
      {
        "tripId": "string",
        "departureTime": "2025-07-01T08:00:00Z",
        "arrivalTime": "2025-07-01T12:00:00Z",
        "status": "active"
      }
      ```
  - [ ] Mettre à jour un horaire (`PUT /api/schedules/{id}`)
    - Use case : Modifier un horaire
    - Scénario nominal :
      1. L’admin modifie les infos d’un horaire
      2. Les modifications sont enregistrées
    - Scénarios d’exception :
      - Horaire non trouvé
      - `tripId` manquant ou invalide
    - Critères d’acceptation :
      - Modifications visibles
    - Paramètres : path (id), body (voir schéma), header (Authorization)
    - Exemple de payload :
      ```json
      {
        "tripId": "string",
        "departureTime": "2025-07-01T09:00:00Z",
        "arrivalTime": "2025-07-01T13:00:00Z",
        "status": "inactive"
      }
      ```
  - [ ] Supprimer un horaire (`DELETE /api/schedules/{id}`)
    - Use case : Suppression d’un horaire
    - Scénario nominal :
      1. L’admin supprime un horaire
    - Scénarios d’exception :
      - Horaire non trouvé
    - Critères d’acceptation :
      - Horaire supprimé
    - Paramètres : path (id), header (Authorization)

- [x] Exposer l’endpoint API `/admin/dashboard/cancelled-trips` pour la liste des voyages annulés (statut `cancelled`)
  - [x] Implémenter le use case `GetCancelledTripsUseCase`
  - [x] Ajouter la route OpenAPI dans le contrôleur admin
  - [x] Documenter le payload attendu et les critères d’acceptation dans la doc
  - [x] Ajouter des tests unitaires et d’intégration pour ce use case

# Endpoints avancés exposés dans le dashboard admin

- [x] `/admin/dashboard/top-destinations` — Classement des lignes les plus populaires
- [x] `/admin/dashboard/low-occupancy-trips` — Voyages à faible taux d’occupation
- [x] `/admin/dashboard/upcoming-departures` — Tableau des prochains départs
- [x] `/admin/dashboard/recent-bookings` — Liste des dernières réservations
- [x] `/admin/dashboard/booking-distribution` — Répartition des réservations par type ou destination
- [x] `/admin/dashboard/cancelled-bookings` — Liste des réservations annulées
- [x] `/admin/dashboard/cancelled-trips` — Liste des voyages annulés

> Pour chaque endpoint :
> - Use case dédié
> - Schéma Zod et documentation OpenAPI
> - Tests unitaires et d’intégration
> - Gestion des erreurs (401/403)

## Tâches Frontend (utilisateur standard)

- [ ] **Réservations**
  - [ ] Lister mes réservations (`GET /api/bookings`)
    - Use case : Voir mes réservations
    - Scénario nominal :
      1. L’utilisateur consulte la liste paginée
    - Scénarios d’exception :
      - Non authentifié
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : query (page, limit), header (Authorization)
  - [ ] Détail d’une réservation (`GET /api/bookings/{id}`)
    - Use case : Voir le détail d’une réservation
    - Scénario nominal :
      1. L’utilisateur consulte le détail
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Détail correct
    - Paramètres : path (id), header (Authorization)
  - [ ] Créer une réservation (`POST /api/reservation`)
    - Use case : Réserver un voyage
    - Scénario nominal :
      1. L’utilisateur soumet le formulaire
      2. La réservation est créée et un lien de paiement généré
    - Scénarios d’exception :
      - Stock insuffisant
    - Critères d’acceptation :
      - Réservation créée
    - Paramètres : body (tripId, seatIds, scheduleId), header (Authorization)
  - [ ] Mettre à jour une réservation (`PUT /api/bookings/{id}`)
    - Use case : Modifier une réservation
    - Scénario nominal :
      1. L’utilisateur modifie les sièges/options
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Modification prise en compte
    - Paramètres : path (id), body (seatIds?, options?), header (Authorization)
  - [ ] Annuler une réservation (`DELETE /api/bookings/{id}`)
    - Use case : Annuler une réservation
    - Scénario nominal :
      1. L’utilisateur annule sa réservation
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Réservation annulée
    - Paramètres : path (id), header (Authorization)

- [ ] **Paiements**
  - [ ] Effectuer un paiement (`POST /api/bookings/{id}/payments`)
    - Use case : Payer une réservation
    - Scénario nominal :
      1. L’utilisateur paie sa réservation
    - Scénarios d’exception :
      - Paiement refusé
    - Critères d’acceptation :
      - Paiement accepté
    - Paramètres : path (id), body (amount, paymentMethod), header (Authorization)
  - [ ] Historique des paiements (`GET /api/bookings/{id}/payments`)
    - Use case : Voir l’historique des paiements
    - Scénario nominal :
      1. L’utilisateur consulte la liste
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : path (id), header (Authorization)

- [ ] **Voyages**
  - [ ] Lister les voyages (`GET /api/trips`)
    - Use case : Voir les voyages disponibles
    - Scénario nominal :
      1. L’utilisateur consulte la liste paginée
    - Scénarios d’exception :
      - Aucun voyage disponible
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : query (page, limit, sort, filter)
  - [ ] Détail d’un voyage (`GET /api/trips/{id}`)
    - Use case : Voir le détail d’un voyage
    - Scénario nominal :
      1. L’utilisateur consulte le détail
    - Scénarios d’exception :
      - Voyage non trouvé
    - Critères d’acceptation :
      - Détail correct
    - Paramètres : path (id)
  - [ ] Plan des places d’un voyage (`GET /api/trips/{id}/seats`)
    - Use case : Voir le plan des places
    - Scénario nominal :
      1. L’utilisateur consulte le plan
    - Scénarios d’exception :
      - Voyage non trouvé
    - Critères d’acceptation :
      - Plan correct
    - Paramètres : path (id), query (scheduleId?)

- [ ] **Horaires**
  - [ ] Plan des places pour un horaire (`GET /api/schedules/{scheduleId}/seats`)
    - Use case : Voir le plan des places pour un horaire
    - Scénario nominal :
      1. L’utilisateur consulte le plan
    - Scénarios d’exception :
      - Horaire non trouvé
    - Critères d’acceptation :
      - Plan correct
    - Paramètres : path (scheduleId)

- [ ] **Routes**
  - [ ] Lister les routes (`GET /api/routes`)
    - Use case : Voir les routes disponibles
    - Scénario nominal :
      1. L’utilisateur consulte la liste paginée
    - Scénarios d’exception :
      - Aucune route disponible
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : query (page, limit, sort, filter)
  - [ ] Détail d’une route (`GET /api/routes/{id}`)
    - Use case : Voir le détail d’une route
    - Scénario nominal :
      1. L’utilisateur consulte le détail
    - Scénarios d’exception :
      - Route non trouvée
    - Critères d’acceptation :
      - Détail correct
    - Paramètres : path (id)
  - [ ] Horaires d’une route (`GET /api/routes/{id}/schedules`)
    - Use case : Voir les horaires d’une route
    - Scénario nominal :
      1. L’utilisateur consulte la liste
    - Scénarios d’exception :
      - Route non trouvée
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : path (id), query (date_start?, date_end?)

- [ ] **Villes et destinations**
  - [ ] Villes de départ (`GET /api/locations/departure-cities`)
    - Use case : Voir les villes de départ
    - Scénario nominal :
      1. L’utilisateur consulte la liste
    - Scénarios d’exception :
      - Aucune ville disponible
    - Critères d’acceptation :
      - Liste correcte
  - [ ] Destinations (`GET /api/locations/destinations`)
    - Use case : Voir les destinations depuis une ville
    - Scénario nominal :
      1. L’utilisateur sélectionne une ville et consulte les destinations
    - Scénarios d’exception :
      - Ville inconnue
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : query (city)

- [ ] **Tarifs**
  - [ ] Obtenir les tarifs (`GET /api/pricing`)
    - Use case : Voir les tarifs disponibles
    - Scénario nominal :
      1. L’utilisateur consulte les tarifs
    - Scénarios d’exception :
      - Pas de tarifs disponibles
    - Critères d’acceptation :
      - Liste correcte
    - Paramètres : query (departureCity, arrivalCity)

- [ ] **Options**
  - [ ] Lister les options (`GET /api/options`)
    - Use case : Voir les options disponibles
    - Scénario nominal :
      1. L’utilisateur consulte la liste
    - Scénarios d’exception :
      - Aucune option disponible
    - Critères d’acceptation :
      - Liste correcte

- [ ] **Statut de paiement**
  - [ ] Obtenir le statut de paiement (`GET /api/payment-status`)
    - Use case : Voir le statut de paiement d’une réservation
    - Scénario nominal :
      1. L’utilisateur consulte le statut
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Statut correct
    - Paramètres : query (bookingId)

- [ ] **Webhooks & Paiement**
  - [ ] Stripe Webhook (`POST /api/stripe/webhook`)
    - Use case : Gérer les événements Stripe
    - Scénario nominal :
      1. Stripe envoie un événement
      2. L’API traite l’événement
    - Scénarios d’exception :
      - Payload invalide
    - Critères d’acceptation :
      - Événement traité
    - Paramètres : body (Stripe payload)
  - [ ] Retry paiement (`POST /api/retry-payment`)
    - Use case : Relancer une session de paiement
    - Scénario nominal :
      1. L’utilisateur relance le paiement
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Nouvelle session créée
    - Paramètres : body (bookingId)
  - [ ] Annuler un voyage et rembourser (`POST /api/cancel-trip`)
    - Use case : Annuler un voyage et demander un remboursement
    - Scénario nominal :
      1. L’utilisateur annule le voyage
      2. Le remboursement est déclenché
    - Scénarios d’exception :
      - Réservation non trouvée
    - Critères d’acceptation :
      - Remboursement effectué
    - Paramètres : body (bookingId)

---

Chaque tâche correspond à un endpoint à implémenter côté frontend ou backend, avec use case, scénario, exceptions, critères d’acceptation et paramètres.

---

### `/admin/dashboard/top-destinations` — Classement des lignes les plus populaires
- **Use case** : Afficher les routes ayant reçu le plus de réservations sur la période.
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne la liste triée des routes par nombre de réservations.
- **Exceptions** : Aucune réservation sur la période → liste vide.
- **Format de retour** :
```json
{
  "topDestinations": [
    { "routeId": "r1", "routeLabel": "Paris-Lyon", "bookings": 120 }
  ]
}
```

### `/admin/dashboard/low-occupancy-trips` — Voyages à faible taux d’occupation
- **Use case** : Identifier les voyages à venir avec un taux de remplissage < 30%.
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne la liste des voyages concernés et une alerte si besoin.
- **Exceptions** : Aucun voyage concerné → liste vide.
- **Format de retour** :
```json
{
  "lowOccupancyTrips": [
    { "tripId": "t1", "label": "Paris-Lyon 2025-07-01", "occupancy": 20 }
  ],
  "alerts": ["Attention : 1 voyage à faible taux d’occupation (<30%)"]
}
```

### `/admin/dashboard/upcoming-departures` — Tableau des prochains départs
- **Use case** : Lister les voyages à venir (date, heure, taux de remplissage, statut).
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne les départs à venir triés par date.
- **Exceptions** : Aucun départ à venir → liste vide.
- **Format de retour** :
```json
{
  "upcomingDepartures": [
    { "scheduleId": "s1", "tripId": "t2", "routeLabel": "Paris-Lyon", "departureTime": "2025-07-01T08:00:00Z", "occupancy": 80, "status": "scheduled" }
  ]
}
```

### `/admin/dashboard/recent-bookings` — Liste des dernières réservations
- **Use case** : Afficher les N dernières réservations (nom utilisateur, voyage, date, statut).
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne les dernières réservations.
- **Exceptions** : Aucune réservation récente → liste vide.
- **Format de retour** :
```json
{
  "recentBookings": [
    { "bookingId": "b1", "userName": "Alice Dupont", "tripId": "t2", "routeLabel": "Paris-Lyon", "bookedAt": "2025-06-28T10:00:00Z", "status": "confirmed" }
  ]
}
```

### `/admin/dashboard/booking-distribution` — Répartition des réservations par type ou destination
- **Use case** : Visualiser la répartition des réservations par type de voyage ou destination.
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne la distribution.
- **Exceptions** : Aucune réservation → liste vide.
- **Format de retour** :
```json
{
  "bookingDistribution": [
    { "type": "standard", "routeId": "r1", "routeLabel": "Paris-Lyon", "count": 42 }
  ]
}
```

### `/admin/dashboard/cancelled-bookings` — Liste des réservations annulées
- **Use case** : Afficher la liste des réservations annulées.
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne les réservations annulées triées par date.
- **Exceptions** : Aucune réservation annulée → liste vide.
- **Format de retour** :
```json
{
  "cancelledBookings": [
    { "bookingId": "b2", "userName": "Bob", "tripId": "t3", "routeLabel": "Lyon-Marseille", "bookedAt": "2025-06-27T09:00:00Z", "status": "cancelled" }
  ]
}
```

### `/admin/dashboard/cancelled-trips` — Liste des voyages annulés
- **Use case** : Afficher la liste des voyages annulés (statut `cancelled`).
- **Scénario nominal** : L’admin consulte le dashboard, l’API retourne les voyages annulés triés par date.
- **Exceptions** : Aucun voyage annulé → liste vide.
- **Format de retour** :
```json
{
  "cancelledTrips": [
    { "tripId": "t3", "routeLabel": "Marseille-Paris", "departureDate": "2025-06-30T08:00:00Z", "status": "cancelled" }
  ]
}
```

---

## TODO technique – Statistiques avancées dashboard admin

- [ ] **Chiffre d’affaires** (`GET /admin/dashboard/revenue`)
  - [ ] Use case : `GetRevenueStatsUseCase` (calcul total, today, week, month)
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

- [ ] **Top utilisateurs** (`GET /admin/dashboard/top-users`)
  - [ ] Use case : `GetTopUsersUseCase` (classement par nombre de réservations)
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

- [ ] **Taux d’annulation** (`GET /admin/dashboard/cancellation-rate`)
  - [ ] Use case : `GetCancellationRateUseCase` (calcul % annulation bookings/trips)
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

- [ ] **Répartition des paiements** (`GET /admin/dashboard/payment-methods`)
  - [ ] Use case : `GetPaymentMethodsStatsUseCase`
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

- [ ] **Nouveaux utilisateurs** (`GET /admin/dashboard/new-users`)
  - [ ] Use case : `GetNewUsersStatsUseCase` (today, week, month)
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

- [ ] **Voyages complets** (`GET /admin/dashboard/full-trips`)
  - [ ] Use case : `GetFullTripsStatsUseCase` (taux de remplissage = 100%) 
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

- [ ] **Alertes spécifiques** (`GET /admin/dashboard/alerts`)
  - [ ] Use case : `GetDashboardAlertsUseCase` (voyages sans conducteur, sans réservations, etc.)
  - [ ] Route/controller + schéma Zod/OpenAPI
  - [ ] Tests unitaires et intégration
  - [ ] Doc payload et critères d’acceptation

> Pour chaque statistique : respecter l’architecture hexagonale (use case, controller, validation, doc, tests).
> Ajouter la doc OpenAPI et la section correspondante dans la doc technique.

---

## TODO technique – Implémentation des endpoints avancés du dashboard admin

### Domaine : Admin / Dashboard

- [ ] **Chiffre d’affaires** (`GET /admin/dashboard/revenue`)
  - Use case : Afficher le chiffre d’affaires total et par période (jour, semaine, mois)
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne les montants agrégés
  - Exceptions : Aucun paiement enregistré → valeurs à 0
  - Critères d’acceptation : Les montants sont corrects et à jour
  - Paramètres : header (Authorization), query (période?)
  - Exemple de retour :
    ```json
    {
      "revenue": {
        "total": 12000,
        "today": 500,
        "week": 3200,
        "month": 9000
      }
    }
    ```
  - Tâches :
    - [ ] Use case `get-revenue.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

- [ ] **Top utilisateurs** (`GET /admin/dashboard/top-users`)
  - Use case : Afficher les utilisateurs ayant effectué le plus de réservations
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne le classement des utilisateurs
  - Exceptions : Aucun utilisateur → liste vide
  - Critères d’acceptation : Classement correct, à jour
  - Paramètres : header (Authorization), query (limit?)
  - Exemple de retour :
    ```json
    {
      "topUsers": [
        { "userId": "u1", "userName": "Alice", "bookings": 12 }
      ]
    }
    ```
  - Tâches :
    - [ ] Use case `get-top-users.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

- [ ] **Taux d’annulation** (`GET /admin/dashboard/cancellation-rate`)
  - Use case : Afficher le taux d’annulation des réservations et des voyages
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne les pourcentages
  - Exceptions : Aucun historique → taux à 0%
  - Critères d’acceptation : Calcul correct, à jour
  - Paramètres : header (Authorization)
  - Exemple de retour :
    ```json
    {
      "cancellationRate": {
        "bookings": 8.5,
        "trips": 3.2
      }
    }
    ```
  - Tâches :
    - [ ] Use case `get-cancellation-rate.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

- [ ] **Répartition des paiements par méthode** (`GET /admin/dashboard/payment-methods`)
  - Use case : Visualiser la répartition des paiements par type (CB, Stripe, espèces, etc.)
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne la distribution
  - Exceptions : Aucun paiement → liste vide
  - Critères d’acceptation : Répartition correcte, à jour
  - Paramètres : header (Authorization)
  - Exemple de retour :
    ```json
    {
      "paymentMethods": [
        { "method": "CB", "count": 80 },
        { "method": "Stripe", "count": 40 }
      ]
    }
    ```
  - Tâches :
    - [ ] Use case `get-payment-methods.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

- [ ] **Nouveaux utilisateurs** (`GET /admin/dashboard/new-users`)
  - Use case : Afficher le nombre de nouveaux inscrits sur la période
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne les totaux par période
  - Exceptions : Aucun nouvel utilisateur → valeurs à 0
  - Critères d’acceptation : Totaux corrects, à jour
  - Paramètres : header (Authorization), query (période?)
  - Exemple de retour :
    ```json
    {
      "newUsers": {
        "today": 2,
        "week": 15,
        "month": 40
      }
    }
    ```
  - Tâches :
    - [ ] Use case `get-new-users.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

- [ ] **Voyages complets** (`GET /admin/dashboard/full-trips`)
  - Use case : Afficher le nombre de voyages complets (taux de remplissage = 100%)
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne le nombre de voyages complets
  - Exceptions : Aucun voyage complet → valeur à 0
  - Critères d’acceptation : Nombre correct, à jour
  - Paramètres : header (Authorization)
  - Exemple de retour :
    ```json
    {
      "fullTrips": 5
    }
    ```
  - Tâches :
    - [ ] Use case `get-full-trips.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

- [ ] **Alertes spécifiques** (`GET /admin/dashboard/alerts`)
  - Use case : Lister les alertes importantes (ex : voyages sans conducteur, sans réservations, etc.)
  - Scénario nominal : L’admin consulte le dashboard, l’API retourne la liste des alertes
  - Exceptions : Aucune alerte → liste vide
  - Critères d’acceptation : Liste correcte, à jour
  - Paramètres : header (Authorization)
  - Exemple de retour :

    ```json
    {
      "alerts": [
        "Voyage t5 sans conducteur assigné",
        "Voyage t8 sans réservation"
      ]
    }
    ```

  - Tâches :
    - [ ] Use case `get-alerts.use-case.ts`
    - [ ] Route/controller
    - [ ] Schéma Zod + OpenAPI
    - [ ] Tests unitaires & intégration
    - [ ] Documentation

---
