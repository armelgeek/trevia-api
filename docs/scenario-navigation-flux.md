# Scénario d’utilisation – Navigation et flux d’appels API

Ce document décrit un parcours utilisateur type sur le site, en détaillant les étapes de navigation et les appels API associés.

---

## 1. Connexion et découverte

1. L’utilisateur arrive sur la page d’accueil.
2. Il clique sur « Se connecter » et saisit ses identifiants.
   - Appel API : `POST /api/auth/login` (non listé, à prévoir)
3. Il accède à son tableau de bord ou à la page de recherche de voyages.

## 2. Recherche et réservation d’un voyage

1. L’utilisateur sélectionne une ville de départ et une destination.
   - Appel API : `GET /api/locations/departure-cities`
   - Appel API : `GET /api/locations/destinations?city=...`
2. Il consulte la liste des voyages disponibles.
   - Appel API : `GET /api/trips?departureCity=...&arrivalCity=...`
3. Il clique sur un voyage pour voir le détail et le plan des places.
   - Appel API : `GET /api/trips/{id}`
   - Appel API : `GET /api/trips/{id}/seats`
4. Il sélectionne ses sièges et options, puis valide la réservation.
   - Appel API : `POST /api/reservation` (body : tripId, seatIds, scheduleId)
5. Un lien de paiement est généré et affiché.

## 3. Paiement

1. L’utilisateur clique sur le lien de paiement et effectue le paiement.
   - Appel API : `POST /api/bookings/{id}/payments` (body : amount, paymentMethod)
2. Il consulte le statut de paiement.
   - Appel API : `GET /api/payment-status?bookingId=...`

## 4. Suivi et gestion des réservations

1. L’utilisateur consulte la liste de ses réservations.
   - Appel API : `GET /api/bookings`
2. Il clique sur une réservation pour voir le détail.
   - Appel API : `GET /api/bookings/{id}`
3. Il peut modifier ou annuler une réservation.
   - Appel API : `PUT /api/bookings/{id}` (modification)
   - Appel API : `DELETE /api/bookings/{id}` (annulation)

## 5. Administration (Admin)

1. L’admin se connecte et accède au dashboard.
   - Appel API : `GET /api/admin/dashboard`
2. Il consulte la liste de toutes les réservations et voyages.
   - Appel API : `GET /api/admin/bookings`
   - Appel API : `GET /api/admin/trips`
3. Il gère les véhicules, rôles et permissions.
   - Appel API : `GET /api/vehicles`, `POST /api/vehicles`, etc.
   - Appel API : `POST /api/v1/roles`, `PUT /api/v1/roles/{roleId}`, etc.

---

Ce scénario permet de visualiser le parcours utilisateur et admin, ainsi que le flux d’appels API à prévoir pour chaque étape clé du site.
