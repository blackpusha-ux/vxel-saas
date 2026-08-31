# VXEL DTF Studio Pro 🚀

SaaS B2B tout-en-un d'optimisation et de préparation d'impressions DTF (Direct to Film).

## ⚡ Fonctionnalités Clés

- **Studio DTF** : Suppression de fond automatique DUO (noir & blanc par flood fill des 4 coins), lissage anti-halo, luma key adaptatif et ajustement couleur.
- **Outil Planche DTF** : Nesting automatique multi-visuels, sélecteur de machines DTF (Epson, Brother, Roland, Mimaki, Coldeso, Prestige, UniHeat), export binaire **DTX Natif v2**, PDF vectoriel 300 DPI, PNG transparent HD, TIFF et EPS.
- **Vectoriseur IA HD (Vectorizer.ai API)** : Vectorisation haute définition automatique avec contours lisses, texte net et lisible, et réduction de bruit sans distorsion de couleur.

---

## 🔑 Configuration de l'API Vectorizer.ai

Pour bénéficier de la vectorisation IA de qualité professionnelle Vectorizer.ai (texte lisible, contours vectoriels lisses, zéro bavure) :

1. Créez un compte sur [Vectorizer.ai API](https://vectorizer.ai/api).
2. Obtenez vos clés d'API (API Key ID et API Secret).
3. Ajoutez les clés dans votre fichier `.env.local` :

```env
VECTORIZER_AI_API_KEY_ID=votre_api_key_id
VECTORIZER_AI_API_SECRET=votre_api_secret
# Ou via clé unique :
VECTORIZER_AI_API_KEY=votre_api_key
```

### 💡 Tarifs & Quotas Vectorizer.ai :
- **Plan Gratuit / Test** : Crédits offerts pour tester l'API.
- **Plan Payant (Pay-as-you-go)** : ~$0.10 par image vectorisée HD.

*Remarque : Si aucune clé n'est configurée, l'application bascule automatiquement sur le vectoriseur de secours local.*

---

## 🛠️ Lancement en Développement

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.
