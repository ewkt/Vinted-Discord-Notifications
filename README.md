# Vinted Bot Discord

Ce bot permet d'envoyer les nouveautés de plusieurs recherche vinted à la fois sur un serveur discord. Il y a 0-délais car la recherche se fait via l'api vinted

**Attention l'API vinted bloque (rate-limit) au dessus de 1 requête par seconde</font>**

Fonctionalités:
----------
- Ajout d'autant de recherches que nécéssaire avec choix du salon vers lequel les nouveaux articles sont envoyés
- Possibilité de customiser la fréquence de recherche (pour minimiser les délais)
- Possibilité de bloquer des mots spécifiques dans le titre


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

