# Vinted Bot Discord

## Ce bot permet d'envoyer les nouveautés d'une recherche vinted sur un serveur discord
## Il y a 0-délais car la recherche se fait via l'api vinted

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
}
```

b) Il faut choisir quelles recherches utiliser dans `channels.json`:
  - channelId est le dernier nombre dans l'url du channel discord quand il est affiché à l'écran
  (https://discord.com/channels/123456789000000000/123456789012345678)
  - pour simplifier la configuration, il suffit de copier-coller l'url de la recherche voulue depuis vinted
  - channelName permet de differencier les recherches dans les log

```
[
  {
    "channelId": "123456789012345678",
    "channelName": "test1",
    "url": "https://www.vinted.fr/catalog?brand_ids[]=53"
  },
]
```

Etape 4: lancer le bot
-------
```
node main.js
```

Pour arreter le bot il suffit de Ctrl+C sur le terminal où le bot est actif.

