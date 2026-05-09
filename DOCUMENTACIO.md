# 🕵️‍♂️ SHADOW HEIST - Documentació Tècnica

> **Projecte:** Joc de Sigil i Robatori 2D
> **Motor:** Phaser 3 | **Llenguatge:** JavaScript (ES6+) | **Construcció:** Vite

---

## 📑 Índex

1. [Descripció General](#-descripció-general)
2. [Estructura de Carpetes](#-estructura-de-carpetes)
3. [Arxius Principals i Funcions](#-arxius-principals-i-funcions)
4. [Funcionalitats Clau](#️-funcionalitats-clau)

---

## 🎯 Descripció General

**Shadow Heist** és un joc de plataformes d'infiltració on ets un lladre buscant el botí en un edifici protegit. Haureu d'esquivar guardes, làsers i càmeres de seguretat, superant minijocs de *hackeig* per desbloquejar portes, fins arribar a la sortida. Està construït sobre una **arquitectura modular i escalable** separant gràfics, lògica i dades.

---

## 📂 Estructura de Carpetes

El codi font està organitzat en petites subcarpetes dins de `/src` per facilitar-ne el manteniment:

- ⚙️ **`config/`** → Paràmetres i variables globals.
- 👤 **`entities/`** → Actors del joc (Jugador, enemics, trampes).
- 🗺️ **`levels/`** → Disseny estructural de cada escenari.
- 🎬 **`scenes/`** → Gestió de les diferents pantalles del joc.
- 🧠 **`systems/`** → Lògica transversal (intel·ligència i jocs).
- 🖱️ **`ui/`** → Botons interactius i components visuals.
- 🛠️ **`utils/`** → Funcions d'ajuda, càlculs i constants.

---

## 📄 Arxius Principals i Funcions

### 1. Nucli

* **`main.js`**: Inicia el motor de Phaser, carrega les físiques i enllaça totes les escenes.
* **`gameConfig.js`**: Centralitza les variables d'ajust (velocitats, con de visió enemics, colors globals).

### 2. Escenes (`/scenes`)

* **`PreloadScene`**: Crea programàticament els gràfics en memòria (*canvas*) i carrega les cançons.
* **`MenuScene`** i **`LevelSelectScene`**: Les pantalles d'inici amb fons animats paral·laxi i els botons per seleccionar el nivell a jugar. Inclou el botó de silenciar la música.
* **`GameScene`**: El motor principal de la partida. Inicia els enemics, calcula les col·lisions (`update`) i respon als controls.
* **`HUDScene`**: Funciona per sobre de `GameScene` i ens mostra la informació del personatge com la vida, temps o botí actual sense interferir amb el joc base.

### 3. Entitats (`/entities`)

* **`Player.js`**: Lògica de l'avatar principal (caminar, saltar, pujar escales).
* **`Guard.js`**: La Intel·ligència Artificial enemic. Té rutes (`waypoints`) de patrulla iteratives.
* **`InteractiveObject.js`**: Gestiona les portes o càmeres quan premem el botó acció (E).

### 4. Sistemes (`/systems`)

* **`StealthSystem.js`**: S'encarrega d'analitzar fins a quin punt l'avatar és "il·luminat" o visible.
* **`DetectionSystem.js`**: Realitza càlculs matemàtics vectorials i de distància per decidir si som vistos o no dins el con de visió.
* **`MiniGameSystem.js`**: Rep l'input de teclat un cop interagim amb un panell, activant el minijoc temporal per *hackejar* dispositius.

### 5. Dades i Eines (`/levels`, `/utils`)

* **`LevelManager.js`**: Es on dissenyem els mapes amb coordenades (`x/y`). Només editant aquest fitxer pots afegir nous nivells sense tocar codi del personatge.
* **`helpers.js`**: Eines vàries per no embrutar els arxius de joc (guarda i llegeix dades al teu navegador web i fa càlculs de radians).

---

## 🕹️ Funcionalitats Clau

1. **Minijocs d'Habilitat:** Ocultar-te no és tot, obrir terminals pausa la partida on et cal prémer tecles correctes (WASD) en un temps limitat per obrir el pas.
2. **Audio i persistència:** El joc pot emmudir tota la banda sonora, una decisió que persisteix encara que refresquis la pàgina web.
3. **Escalabilitat Ràpida:** El joc no requereix *spritesheets* d'imatges externes en carpetes. Tot és auto-generat, reduint la dependència i fent l'estructura completament independent i neta.
