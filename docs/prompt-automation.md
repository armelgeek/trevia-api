# Prompt d’automatisation d’équipe de développement (version avancée)

1. Lis le fichier `docs/endpoints-summary.md`.
2. Pour chaque endpoint, génère une tâche TODO claire et concise à réaliser côté développement frontend ou backend.
3. Pour chaque tâche, ajoute :
   - Un use case associé (titre et description)
   - Un scénario nominal (étapes principales du succès)
   - Un ou plusieurs scénarios d’exception (erreurs, cas limites)
   - Les critères d’acceptation (liste à puces)
   - Les paramètres attendus (query, path, body, etc.) et le body de la requête si applicable
4. Sépare les tâches en deux catégories : **Admin** (prioritaires) et **Frontend** (utilisateur standard).
5. Priorise les tâches Admin en les plaçant en haut de la liste.
6. Regroupe toutes les tâches dans une liste Markdown structurée (par endpoint ou par domaine).
7. Ajoute une case à cocher devant chaque tâche pour le suivi.
8. Écris le tout dans un fichier `todo.md`.

---

**Exemple d’utilisation** :
« Lis la documentation de mon API et génère automatiquement une todo-list exhaustive (format Markdown) pour l’implémentation de tous les endpoints, avec use case, scénario nominal, exceptions, critères d’acceptation, paramètres et body pour chaque tâche, en séparant et priorisant les tâches admin. »
