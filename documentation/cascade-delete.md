# Suppression en cascade des voyages

## Problème résolu

Lors de la suppression d'un voyage, une erreur de contrainte de clé étrangère était générée :
```
"UPDATE ou DELETE sur la table « trips » viole la contrainte de clé étrangère « schedules_trip_id_trips_id_fk » de la table « schedules »"
```

## Solution implémentée

La méthode `delete` du `TripRepositoryImpl` a été modifiée pour effectuer une suppression en cascade dans une transaction, dans l'ordre suivant :

### Ordre de suppression

1. **booking_seats** : Suppression des liaisons entre réservations et sièges
2. **seats** : Suppression des sièges associés aux horaires
3. **bookings** : Suppression des réservations du voyage
4. **schedules** : Suppression des horaires du voyage
5. **trips** : Suppression du voyage lui-même

### Code implémenté

```typescript
async delete(id: string): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      // 1. Récupérer tous les schedules de ce trip
      const tripSchedules = await tx.select({ id: schedules.id }).from(schedules).where(eq(schedules.tripId, id))
      
      const scheduleIds = tripSchedules.map((s) => s.id)
      
      if (scheduleIds.length > 0) {
        // 2. Récupérer tous les sièges des schedules
        const scheduleSeats = await tx.select({ id: seats.id }).from(seats).where(inArray(seats.scheduleId, scheduleIds))
        
        const seatIds = scheduleSeats.map((s) => s.id)
        
        // 3. Supprimer les booking_seats liés aux sièges
        if (seatIds.length > 0) {
          await tx.delete(bookingSeats).where(inArray(bookingSeats.seatId, seatIds))
        }
        
        // 4. Supprimer les sièges des schedules
        await tx.delete(seats).where(inArray(seats.scheduleId, scheduleIds))
      }
      
      // 5. Supprimer les bookings de ce trip
      await tx.delete(bookings).where(eq(bookings.tripId, id))
      
      // 6. Supprimer les schedules de ce trip
      await tx.delete(schedules).where(eq(schedules.tripId, id))
      
      // 7. Enfin, supprimer le trip
      await tx.delete(trips).where(eq(trips.id, id))
    })
    
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression du voyage:', error)
    return false
  }
}
```

## Avantages de cette approche

1. **Intégrité des données** : Garantit que toutes les données liées sont supprimées
2. **Atomicité** : Utilise une transaction pour s'assurer que toutes les suppressions réussissent ou échouent ensemble
3. **Performance** : Effectue les suppressions en batch pour les éléments multiples
4. **Gestion d'erreurs** : Capture et log les erreurs pour faciliter le débogage

## Alternative : Configuration de contraintes en cascade

Une autre approche serait de modifier le schéma de base de données pour ajouter `onDelete: 'cascade'` aux relations, mais la solution actuelle offre plus de contrôle et de transparence.

## Test

Utilisez le script `test-delete-trip.sh` pour tester la suppression en cascade :

```bash
./scripts/test-delete-trip.sh <trip-id>
```

Ce script vérifie :
- L'existence du voyage avant suppression
- Les schedules associés
- La suppression effective
- La vérification que les dépendances ont été supprimées
