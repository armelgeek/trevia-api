# Prompt d’automatisation de démarrage de projet backend API

1. Prends en entrée une description fonctionnelle du projet (ex : « site de vente de vêtements », « plateforme de réservation de voyages », etc.).
2. Analyse les besoins métier et déduis les principales entités, fonctionnalités et domaines en profondi pour tous cerner et avoir tous les informations
3. Génère une liste exhaustive d’endpoints RESTful à créer (CRUD, auth, recherche, etc.), avec pour chaque endpoint :
   - Une tâche TODO claire et concise
   - Un use case associé (titre et description)
   - Un scénario nominal (étapes principales du succès)
   - Un ou plusieurs scénarios d’exception (erreurs, cas limites)
   - Les critères d’acceptation (liste à puces)
   - Les paramètres attendus (query, path, body, etc.) et le body de la requête si applicable
   - (Optionnel) Un exemple de payload JSON
4. Sépare les tâches par domaine ou ressource (ex : Utilisateur, Produit, Commande, Auth…)
5. Regroupe toutes les tâches dans une liste Markdown structurée, avec cases à cocher pour le suivi.
6. Écris le tout dans un fichier `todo-backend.md`.

---

**Exemple d’utilisation** :
« Voici la description de mon projet : site de vente de vêtements. Génère automatiquement une todo-list exhaustive (format Markdown) pour le backend, avec endpoints à créer, use case, scénarios, critères d’acceptation, paramètres et exemples de body pour chaque tâche. »
