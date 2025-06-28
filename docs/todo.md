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
