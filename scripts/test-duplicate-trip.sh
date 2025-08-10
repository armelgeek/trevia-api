#!/bin/bash

# Script de test pour l'endpoint de duplication de voyage
# Usage: ./test-duplicate-trip.sh <trip-id> [day-increment] [include-schedules]

TRIP_ID=$1
DAY_INCREMENT=${2:-4}
INCLUDE_SCHEDULES=${3:-true}
BASE_URL="http://localhost:3000/api"

if [ -z "$TRIP_ID" ]; then
    echo "Usage: $0 <trip-id> [day-increment] [include-schedules]"
    echo "Exemple: $0 trip-123 4 true"
    exit 1
fi

echo "🚀 Test de duplication du voyage $TRIP_ID"
echo "⏰ Incrément de jours: $DAY_INCREMENT"
echo "📅 Inclure les schedules: $INCLUDE_SCHEDULES"
echo ""

# Test 1: Duplication avec incrément de jours
echo "📋 Test 1: Duplication avec incrément de $DAY_INCREMENT jours et includeSchedules=$INCLUDE_SCHEDULES"
response=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/duplicate" \
    -H "Content-Type: application/json" \
    -d "{\"dayIncrement\": $DAY_INCREMENT, \"includeSchedules\": $INCLUDE_SCHEDULES}")

echo "Réponse: $response"
echo ""

# Extraire le nouvel ID du voyage si la duplication a réussi
NEW_TRIP_ID=$(echo "$response" | grep -o '"newTripId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_TRIP_ID" ]; then
    echo "✅ Duplication réussie! Nouveau voyage ID: $NEW_TRIP_ID"
    
    # Test 2: Vérifier que le nouveau voyage existe
    echo ""
    echo "📋 Test 2: Vérification de l'existence du nouveau voyage"
    trip_check=$(curl -s "$BASE_URL/trips/$NEW_TRIP_ID")
    echo "Détails du nouveau voyage: $trip_check"
    
    # Test 3: Comparer avec le voyage original
    echo ""
    echo "📋 Test 3: Comparaison avec le voyage original"
    original_trip=$(curl -s "$BASE_URL/trips/$TRIP_ID")
    echo "Voyage original: $original_trip"
else
    echo "❌ Échec de la duplication"
fi

echo ""
echo "🏁 Tests terminés"
