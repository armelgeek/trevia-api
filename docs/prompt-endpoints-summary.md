# Prompt d’automatisation – Génération du Endpoint Summary

1. Lis la documentation de l’API, le code source, ou la description fonctionnelle du projet.
2. Pour chaque ressource ou domaine, identifie tous les endpoints exposés (CRUD, actions spécifiques, webhooks, etc.).
3. Pour chaque endpoint, liste :
   - La méthode HTTP (GET, POST, PUT, DELETE, etc.)
   - Le chemin complet (ex : `/api/bookings/{id}`)
   - Les paramètres attendus (query, path, body)
   - Si une authentification est requise (Oui/Non/Admin)
   - Une description concise de la fonctionnalité
   - (Optionnel) Un exemple de body ou de schéma si pertinent
4. Regroupe les endpoints par domaine ou ressource (ex : Réservations, Paiements, Admin…).
5. Structure le tout dans un fichier Markdown clair, avec titres, sous-titres et listes à puces.
6. Ajoute une note de bas de page pour renvoyer vers la documentation OpenAPI/Swagger pour les schémas détaillés.

---

**Exemple d’utilisation** :
« Lis le code source de mon API et génère un résumé exhaustif de tous les endpoints, avec méthode, chemin, paramètres, body, authentification et description, regroupés par domaine, au format Markdown. »
