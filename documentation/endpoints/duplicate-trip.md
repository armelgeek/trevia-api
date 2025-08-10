# Endpoint de Duplication de Voyage

## POST `/api/trips/{id}/duplicate`

Cet endpoint permet de dupliquer un voyage existant avec tous ses schedules et sièges associés.

### Paramètres

#### Path Parameters
- `id` (string, requis) : ID du voyage à dupliquer

#### Body Parameters (JSON)
```json
{
  "newDepartureDate": "2025-08-15T10:00:00.000Z", // optionnel
  "dayIncrement": 7, // optionnel, défaut: 1
  "includeSchedules": true // optionnel, défaut: true
}
```

- `newDepartureDate` (string, optionnel) : Date de départ spécifique pour le nouveau voyage. Si fournie, `dayIncrement` est ignoré.
- `dayIncrement` (number, optionnel) : Nombre de jours à ajouter à la date de départ originale. Défaut: 1 jour.
- `includeSchedules` (boolean, optionnel) : Si `true`, duplique aussi les schedules et sièges. Si `false`, duplique seulement le voyage. Défaut: `true`.

### Réponses

#### 201 - Succès
```json
{
  "originalTripId": "trip-123",
  "newTripId": "trip-456",
  "newDepartureDate": "2025-08-15T10:00:00.000Z",
  "schedulesCount": 3,
  "seatsCount": 48
}
```

#### 400 - Erreur de validation
```json
{
  "error": "Message d'erreur descriptif"
}
```

#### 404 - Voyage non trouvé
```json
{
  "error": "Voyage non trouvé"
}
```

### Comportement

1. **Duplication du voyage principal** : Crée une copie exacte du voyage avec un nouvel ID
2. **Duplication des schedules** : Tous les horaires du voyage original sont dupliqués
3. **Duplication des sièges** : Tous les sièges de chaque schedule sont dupliqués avec leurs configurations
4. **Gestion des dates** : 
   - Si `newDepartureDate` est fournie, cette date est utilisée
   - Sinon, la date originale est incrémentée de `dayIncrement` jours (défaut: 1)
   - Si le voyage original n'a pas de date, la date d'aujourd'hui + `dayIncrement` est utilisée
5. **Gestion des schedules** :
   - Si `includeSchedules` est `true` (défaut), tous les schedules et sièges sont dupliqués
   - Si `includeSchedules` est `false`, seul le voyage principal est dupliqué
6. **Statut** : Le nouveau voyage est créé avec le statut "scheduled"

### Exemples d'utilisation

#### Duplication avec incrémentation automatique (1 jour)
```bash
curl -X POST /api/trips/trip-123/duplicate \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Duplication avec incrémentation de 7 jours
```bash
curl -X POST /api/trips/trip-123/duplicate \
  -H "Content-Type: application/json" \
  -d '{"dayIncrement": 7}'
```

#### Duplication avec date spécifique
```bash
curl -X POST /api/trips/trip-123/duplicate \
  -H "Content-Type: application/json" \
  -d '{"newDepartureDate": "2025-08-15T10:00:00.000Z"}'
```

#### Duplication du voyage seulement (sans schedules)
```bash
curl -X POST /api/trips/trip-123/duplicate \
  -H "Content-Type: application/json" \
  -d '{"dayIncrement": 4, "includeSchedules": false}'
```

### Cas d'usage

- **Voyages réguliers** : Créer facilement des voyages hebdomadaires ou quotidiens
- **Voyages saisonniers** : Dupliquer des voyages populaires pour des périodes similaires
- **Tests** : Créer des données de test rapidement
- **Planification** : Créer plusieurs instances d'un même voyage pour différentes dates
