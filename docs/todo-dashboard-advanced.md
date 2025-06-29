# TODO – Dashboard Admin (indicateurs avancés)

## Statistiques principales (déjà en place)
- [x] Nombre total de réservations (`totalBookings`)
- [x] Nombre total de voyages (`totalTrips`)
- [x] Nombre d’utilisateurs inscrits (`totalUsers`)
- [x] Nombre de véhicules actifs (`totalActiveVehicles`)
- [x] Taux d’occupation moyen (`averageOccupancyRate`)
- [x] Courbe des réservations sur 30 jours (`bookingTrends`)
- [x] Nombre de voyages à venir (aujourd’hui, semaine, mois) (`upcomingTrips`)

## Indicateurs avancés à implémenter
- [x] Taux d’occupation par ligne (route) et par véhicule *(calculé sur les voyages à venir, en tenant compte des schedules associés)*
- [x] Répartition des réservations par type de voyage ou destination
- [x] Détection des voyages à faible remplissage (< 30% de sièges réservés)
- [x] Tableau des prochains départs (horaire, taux de remplissage, statut)
- [x] Liste des dernières réservations (nom, voyage, date, statut)
- [x] Top destinations (classement des lignes les plus populaires)
- [x] Voyages annulés (`/admin/dashboard/cancelled-trips`)

---

> **À faire** :
> - Diviser le use case dashboard en plusieurs endpoints REST spécialisés (ex : `/admin/dashboard/upcoming-departures`, `/admin/dashboard/recent-bookings`, etc.) pour chaque indicateur avancé, afin de faciliter la maintenance, la scalabilité et la documentation.
> - Adapter la documentation OpenAPI et les tests pour chaque endpoint séparé.

---

## Détail des tâches avancées

### 1. Taux d’occupation par ligne ou véhicule
- [x] Calculer le taux d’occupation pour chaque route (places réservées / places totales), **en tenant compte des schedules (horaires) associés aux trips à venir**
- [x] Calculer le taux d’occupation pour chaque véhicule (places réservées / places totales), **en tenant compte des schedules (horaires) associés aux trips à venir**
- [x] Ajouter un champ `occupancyByRoute` (ex: `{ routeId: string, label: string, occupancy: number }[]`)
- [x] Ajouter un champ `occupancyByVehicle` (ex: `{ vehicleId: string, label: string, occupancy: number }[]`)

### 2. Répartition des réservations par type de voyage ou destination
- [x] Grouper les réservations par type de voyage (ex: régulier, occasionnel)
- [x] Grouper les réservations par destination (ville d’arrivée)
- [x] Ajouter un champ `bookingDistribution` (ex: `{ type: string, count: number }[]` et/ou `{ destination: string, count: number }[]`)

### 3. Voyages à faible remplissage
- [x] Identifier les voyages à venir avec un taux de remplissage < 30%
- [x] Ajouter un champ `lowOccupancyTrips` (ex: `{ tripId: string, label: string, occupancy: number }[]`)
- [x] Générer une alerte si au moins un voyage est concerné

### 4. Prochains départs
- [x] Lister les voyages à venir (date, heure, taux de remplissage, statut)
- [x] Ajouter un champ `upcomingDepartures` (ex: `{ tripId, routeLabel, departureDate, occupancy, status }[]`)

### 5. Dernières réservations
- [x] Récupérer les N dernières réservations (nom utilisateur, voyage, date, statut)
- [x] Ajouter un champ `recentBookings` (ex: `{ bookingId, userName, tripLabel, bookedAt, status }[]`)

### 6. Top destinations
- [x] Classer les lignes (routes) par nombre de réservations
- [x] Ajouter un champ `topDestinations` (ex: `{ destination: string, count: number }[]`)

### 7. Voyages annulés
- [x] Récupérer les voyages annulés (statut `cancelled`)
- [x] Ajouter un champ `cancelledTrips` (ex: `{ tripId: string, routeLabel: string, departureDate: string, status: string }[]`)
- [x] Endpoint dédié : `/admin/dashboard/cancelled-trips`
- [x] Schéma Zod et documentation OpenAPI
- [x] Tests unitaires et d’intégration

**Exemple de payload** :
```json
[
  { "tripId": "t3", "routeLabel": "Marseille-Paris", "departureDate": "2025-06-30T08:00:00Z", "status": "cancelled" }
]
```

**Critères d’acceptation** :
- Retourne tous les voyages dont le statut est `cancelled`, triés par date décroissante
- Limite paramétrable (défaut 20)
- Gère les cas sans données (retourne un tableau vide)
- Statuts d’erreur 401/403 gérés

---

## Exemples de payloads attendus

### occupancyByRoute
```json
[
  { "routeId": "r1", "label": "Paris-Lyon", "occupancy": 75 },
  { "routeId": "r2", "label": "Lyon-Marseille", "occupancy": 60 }
]
```

### lowOccupancyTrips
```json
[
  { "tripId": "t1", "label": "Paris-Lyon 2025-07-01", "occupancy": 20 }
]
```

### upcomingDepartures
```json
[
  { "tripId": "t2", "routeLabel": "Paris-Lyon", "departureDate": "2025-07-01T08:00:00Z", "occupancy": 80, "status": "scheduled" }
]
```

### recentBookings
```json
[
  { "bookingId": "b1", "userName": "Alice Dupont", "tripLabel": "Paris-Lyon", "bookedAt": "2025-06-28T10:00:00Z", "status": "confirmed" }
]
```

### topDestinations
```json
[
  { "destination": "Lyon", "count": 120 },
  { "destination": "Marseille", "count": 80 }
]
```

### cancelledTrips
```json
[
  { "tripId": "t3", "routeLabel": "Marseille-Paris", "departureDate": "2025-06-30T08:00:00Z", "status": "cancelled" }
]
```

---

## Critères d’acceptation
- [ ] Tous les indicateurs sont exposés dans la réponse `/admin/dashboard`
- [ ] Les calculs sont robustes, typés, et testés
- [ ] La documentation OpenAPI est à jour
- [ ] Les scénarios d’exception (aucune donnée, données incomplètes) sont gérés
- [ ] Les tests unitaires et d’intégration couvrent chaque indicateur
