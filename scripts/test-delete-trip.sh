#!/bin/bash

# Script de test pour la suppression d'un voyage avec suppression en cascade
# Usage: ./test-delete-trip.sh <trip-id>

TRIP_ID=$1
BASE_URL="http://localhost:3000/api"

if [ -z "$TRIP_ID" ]; then
    echo "Usage: $0 <trip-id>"
    echo "Exemple: $0 trip-123"
    exit 1
fi

echo "🗑️  Test de suppression du voyage $TRIP_ID"
echo ""

# Étape 1: Vérifier que le voyage existe avant suppression
echo "📋 Étape 1: Vérification de l'existence du voyage"
trip_check=$(curl -s "$BASE_URL/trips/$TRIP_ID")
if echo "$trip_check" | grep -q '"tripId"'; then
    echo "✅ Le voyage existe"
    echo "Détails: $trip_check"
else
    echo "❌ Le voyage n'existe pas ou n'est pas accessible"
    echo "Réponse: $trip_check"
    exit 1
fi

echo ""

# Étape 2: Vérifier les dépendances (schedules)
echo "📋 Étape 2: Vérification des schedules associés"
schedules_check=$(curl -s "$BASE_URL/schedules?tripId=$TRIP_ID")
echo "Schedules trouvés: $schedules_check"

echo ""

# Étape 3: Supprimer le voyage
echo "📋 Étape 3: Suppression du voyage"
response=$(curl -s -X DELETE "$BASE_URL/trips/$TRIP_ID")
echo "Réponse de suppression: $response"

echo ""

# Étape 4: Vérifier que le voyage a été supprimé
echo "📋 Étape 4: Vérification de la suppression"
verification=$(curl -s "$BASE_URL/trips/$TRIP_ID")
if echo "$verification" | grep -q "non trouvé\|not found\|404"; then
    echo "✅ Le voyage a été supprimé avec succès"
else
    echo "❌ Le voyage existe encore"
    echo "Réponse: $verification"
fi

echo ""

# Étape 5: Vérifier que les schedules ont été supprimés
echo "📋 Étape 5: Vérification que les schedules ont été supprimés"
schedules_after=$(curl -s "$BASE_URL/schedules?tripId=$TRIP_ID")
echo "Schedules après suppression: $schedules_after"

echo ""
echo "🏁 Test de suppression terminé"
