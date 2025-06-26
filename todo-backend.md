# TODO-list backend – Site de vente de vêtements

## Domaine : Utilisateur

- [ ] **Créer un utilisateur**
  - Use case : Inscription d’un nouvel utilisateur
  - Scénario nominal :
    1. L’utilisateur soumet ses informations (nom, email, mot de passe)
    2. Le compte est créé et un email de confirmation est envoyé
  - Scénarios d’exception :
    - Email déjà utilisé
    - Mot de passe trop faible
  - Critères d’acceptation :
    - L’utilisateur reçoit un email de confirmation
    - Les données sont validées
  - Paramètres : body (nom, email, mot de passe)

    ```json
    {
      "name": "Alice",
      "email": "alice@example.com",
      "password": "StrongPass123!"
    }
    ```

- [ ] **Connexion utilisateur**
  - Use case : Authentification
  - Scénario nominal :
    1. L’utilisateur saisit son email et mot de passe
    2. Un token d’authentification est retourné
  - Scénarios d’exception :
    - Mauvais identifiants
    - Compte non confirmé
  - Critères d’acceptation :
    - Token JWT retourné si succès
  - Paramètres : body (email, mot de passe)

    ```json
    {
      "email": "alice@example.com",
      "password": "StrongPass123!"
    }
    ```

- [ ] **Récupération du profil utilisateur**
  - Use case : Consultation du profil
  - Scénario nominal :
    1. L’utilisateur authentifié demande son profil
    2. Les informations sont retournées
  - Scénarios d’exception :
    - Utilisateur non authentifié
  - Critères d’acceptation :
    - Les informations du profil sont correctes
  - Paramètres : header (Authorization)

## Domaine : Produit

- [ ] **Créer un produit**
  - Use case : Ajout d’un nouveau vêtement au catalogue
  - Scénario nominal :
    1. L’admin soumet les infos du produit
    2. Le produit est ajouté au catalogue
  - Scénarios d’exception :
    - Champs obligatoires manquants
    - Produit déjà existant
  - Critères d’acceptation :
    - Produit visible dans le catalogue
  - Paramètres : body (nom, description, prix, stock, images, catégorie)

    ```json
    {
      "name": "T-shirt blanc",
      "description": "T-shirt 100% coton",
      "price": 19.99,
      "stock": 100,
      "images": ["url1", "url2"],
      "category": "T-shirts"
    }
    ```

- [ ] **Lister les produits**
  - Use case : Consultation du catalogue
  - Scénario nominal :
    1. L’utilisateur consulte la liste des produits
  - Scénarios d’exception :
    - Aucun produit disponible
  - Critères d’acceptation :
    - Liste paginée retournée
  - Paramètres : query (page, limit, filtre catégorie)

- [ ] **Mettre à jour un produit**
  - Use case : Modification d’un produit
  - Scénario nominal :
    1. L’admin modifie les infos d’un produit
    2. Les modifications sont enregistrées
  - Scénarios d’exception :
    - Produit non trouvé
  - Critères d’acceptation :
    - Les modifications sont visibles
  - Paramètres : path (id), body (champs à modifier)

- [ ] **Supprimer un produit**
  - Use case : Suppression d’un produit du catalogue
  - Scénario nominal :
    1. L’admin supprime un produit
    2. Le produit n’est plus visible
  - Scénarios d’exception :
    - Produit non trouvé
  - Critères d’acceptation :
    - Produit supprimé du catalogue
  - Paramètres : path (id)

## Domaine : Commande

- [ ] **Créer une commande**
  - Use case : Passer une commande
  - Scénario nominal :
    1. L’utilisateur sélectionne des produits et valide son panier
    2. La commande est créée et un email de confirmation est envoyé
  - Scénarios d’exception :
    - Stock insuffisant
    - Utilisateur non authentifié
  - Critères d’acceptation :
    - Commande créée et email envoyé
  - Paramètres : body (liste produits, adresse livraison, paiement)

    ```json
    {
      "products": [
        { "id": 1, "quantity": 2 },
        { "id": 2, "quantity": 1 }
      ],
      "shippingAddress": "12 rue de Paris, 75000 Paris",
      "payment": { "method": "CB", "transactionId": "abc123" }
    }
    ```

- [ ] **Lister les commandes d’un utilisateur**
  - Use case : Historique des commandes
  - Scénario nominal :
    1. L’utilisateur authentifié consulte ses commandes
  - Scénarios d’exception :
    - Utilisateur non authentifié
  - Critères d’acceptation :
    - Liste correcte retournée
  - Paramètres : header (Authorization)

- [ ] **Mettre à jour le statut d’une commande**
  - Use case : Suivi de commande (admin)
  - Scénario nominal :
    1. L’admin modifie le statut (expédiée, livrée, annulée)
  - Scénarios d’exception :
    - Commande non trouvée
  - Critères d’acceptation :
    - Statut mis à jour
  - Paramètres : path (id), body (nouveau statut)

## Domaine : Authentification

- [ ] **Réinitialisation du mot de passe**
  - Use case : Mot de passe oublié
  - Scénario nominal :
    1. L’utilisateur demande la réinitialisation
    2. Un email avec un lien est envoyé
  - Scénarios d’exception :
    - Email non trouvé
  - Critères d’acceptation :
    - Email envoyé si email existe
  - Paramètres : body (email)

- [ ] **Confirmation d’email**
  - Use case : Activation du compte
  - Scénario nominal :
    1. L’utilisateur clique sur le lien reçu
    2. Le compte est activé
  - Scénarios d’exception :
    - Lien expiré ou invalide
  - Critères d’acceptation :
    - Compte activé si lien valide
  - Paramètres : query (token)

---

Chaque tâche correspond à un endpoint RESTful à implémenter, avec use case, scénarios, critères d’acceptation, paramètres et exemples de body si pertinent.
