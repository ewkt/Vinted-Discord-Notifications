###nouvelle fonctionalité autobuy!

configuration:
  il faut récupérer des infos en capturant le trafic lors d'un login sur vinted.fr
  - trouver 'access_token' et 'refresh_token' dans le "POST" à 'https://www.vinted.fr/oauth/token'.
  - trouver le cookie 'X-CSRF-Token' dans les headers d'une requete comme 'checkout'.
  Placer ces informations dans le fichier tokens.json comme indiqué dans la template

Cette fonctionalité est encore en cours de développement, pour l'instant pas de fonctionalités après l'achat.
Pas non plus de suivi de l'etat de l'achat dans dsicord, il faudra consulter les logs sur le terminal pour débeuguer.
N'hesitez pas a ouvrir un nouveau 'issue' pour tout problème rencontré ou si vous avez des recommendations.
Il semblerait que le token n'est pas rafraichi malgrés la requête à l'url concerné => si il y a une erreur d'authentification il faut refaire la manip pour regenérer des tokens.

TODO:
-ajouter des slash commands pour rendre la configuration plus facile au démarrage (interface dans discord)
-faire du post-processing après achat (envoyer les articles acheté en DM?)




# Vinted Bot Discord

Ce bot permet d'envoyer les nouveautés de plusieurs recherche vinted à la fois sur un serveur discord. Il y a 0-délais car la recherche se fait via l'api vinted

**Attention l'API vinted bloque (rate-limit) au dessus de 1 requête par seconde</font>**

Fonctionalités:
----------
- Ajout d'autant de recherches que nécéssaire avec choix du salon vers lequel les nouveaux articles sont envoyés
- Possibilité de customiser la fréquence de recherche (pour minimiser les délais)
- Possibilité de bloquer des mots spécifiques dans le titre
- Possibilité d'intégrer des proxy (dans proxies.txt) pour augmenter le nombre de requetes faites par minute


Pré-requis:
----------

- Avoir un environement pour executer un programme en Node.js (npm et node a minima)
- Avoir un serveur discord
- Avoir créé un bot, avoir son token et l'avoir invité dans son serveur


Etape 1: telecharger le code complet et ouvrir un terminal dans le projet
-------

Etape 2: installer les dépendances
-------
```
npm i
```

Etape 3: configurer le bot
-------

a) Il faut ajouter le token du bot discord dans `config.json` :
```
{
  "token": "xxxxxxxx"
  "INTERVAL_TIME": "3600000"
}
```

INTERVAL_TIME: représente la fréquence à laquelle le bot va rafraichir son cookie en millisecondes (entre 1h et 2h est recommandé)

b) Il faut choisir quelles recherches utiliser dans `channels.json`:
  - channelId est le dernier nombre dans l'url du channel discord quand il est affiché à l'écran
(https://discord.com/channels/123456789000000000/---123456789012345678---)
  - channelName permet de differencier les recherches dans les log
  - url est l'url de la recherche vinted (il suffit de copier-coller l'url de la recherche voulue depuis vinted)
  - frequency est le délais en millisecondes entre deux recherches sur cet url
  - filterWords est une liste de mots (entre guillemets séparés par des virgules) qui permettent d'exclure les annonces qui ont ces mots dans leur titre.

```
[
  {
    "channelId": "123456789012345678",
    "channelName": "test1",
    "url": "https://www.vinted.fr/catalog?brand_ids[]=53",
    "frequency": 60000,
    "filterWords": ["nike","puma"]
  },
  {
    ...
  }
]
```


Etape 4: lancer le bot
-------
```
node main.js
```

Pour arreter le bot il suffit de Ctrl+C sur le terminal où le bot est actif.

