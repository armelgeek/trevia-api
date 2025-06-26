# Prompt d’automatisation de scénario de navigation et flux API

1. Prends en entrée une todo-list structurée des endpoints et tâches (ex : `docs/todo.md`).
2. Analyse les endpoints, leurs domaines et leurs usages (admin, utilisateur standard, etc.).
3. Génère un ou plusieurs scénarios d’utilisation typiques du site, en décrivant :
   - Les étapes de navigation (pages, actions utilisateur)
   - Le flux d’appels API associé à chaque étape (méthode, endpoint, paramètres principaux)
   - Les transitions entre les étapes (succès, erreurs, alternatives)
4. Structure le scénario en étapes numérotées, avec sous-étapes si besoin.
5. Sépare les parcours utilisateur standard et admin si pertinent.
6. Écris le tout dans un fichier `scenario-navigation-flux.md`.

---

**Exemple d’utilisation** :
« Voici ma todo-list des endpoints dans `docs/todo.md`. Génère un scénario d’utilisation du site, étape par étape, en détaillant la navigation et le flux d’appels API pour chaque action clé, et écris le tout dans `scenario-navigation-flux.md`. »
