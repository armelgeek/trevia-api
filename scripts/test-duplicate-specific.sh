#!/bin/bash

# Test spécifique avec le payload mentionné par l'utilisateur
# dayIncrement: 4, includeSchedules: true

TRIP_ID=${1:-"trip-123"}
BASE_URL="http://localhost:3000/api"

echo "🚀 Test de duplication avec le payload spécifique"
echo "Trip ID: $TRIP_ID"
echo "Payload: dayIncrement=4, includeSchedules=true"
echo ""

# Test avec le payload exact
echo "📋 Test de duplication..."
response=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/duplicate" \
    -H "Content-Type: application/json" \
    -d '{"dayIncrement": 4, "includeSchedules": true}')

echo "📝 Réponse complète:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Vérifier si la duplication a réussi
if echo "$response" | grep -q '"newTripId"'; then
    echo "✅ Duplication réussie!"
    NEW_TRIP_ID=$(echo "$response" | grep -o '"newTripId":"[^"]*"' | cut -d'"' -f4)
    echo "🆔 Nouveau voyage ID: $NEW_TRIP_ID"
    
    # Statistiques
    SCHEDULES_COUNT=$(echo "$response" | grep -o '"schedulesCount":[0-9]*' | cut -d':' -f2)
    SEATS_COUNT=$(echo "$response" | grep -o '"seatsCount":[0-9]*' | cut -d':' -f2)
    
    echo "📊 Statistiques:"
    echo "   - Schedules dupliqués: $SCHEDULES_COUNT"
    echo "   - Sièges dupliqués: $SEATS_COUNT"
else
    echo "❌ Échec de la duplication"
    echo "📝 Détails de l'erreur:"
    echo "$response"
fi

echo ""
echo "🏁 Test terminé"
