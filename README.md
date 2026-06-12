# Travel Planner App

Web aplikacija za planiranje putovanja, omogućava korisnicima da kreiraju planove putovanja, upravljaju destinacijama, aktivnostima, budžetom i listom, i da dele planove sa drugima putem linka ili QR koda sa i bez mogućnostima izmene.

# Arhitektura sistema

Backend je razvijen kao mikroservisna arhitektura na Microsoft Service Fabric platformi, sa Microsoft SQL Server bazom podataka.

Backend se sastoji od četiri servisa. 
AuthService je stateless servis zadužen za registraciju, prijavu, izdavanje JWT tokena i upravljanje korisnicima i ulogama, i radi na portu 5001. 
TravelService je takođe stateless, on upravlja planovima putovanja, destinacijama, aktivnostima, troškovima, listom i deljenjem planova, na portu 5002. 
NotificationService je stateful servis koji prima evente o izmenama planova preko Service Fabric Remoting-a i obrađuje ih iz pouzdanog reda. 
BackendSF je dodatni stateless servis u sistemu.

Frontend je razvijen korišćenjem React tehnologije, komunicira sa backend servisima preko REST API-ja, sa JWT autentikacijom i role-based pristupom.

Komunikacija između TravelService i NotificationService ide preko Service Fabric Service Remoting (event-driven), dok frontend komunicira sa AuthService i TravelService preko HTTP-a.

# Nameštanje

Pre pokretanja, potrebno je instalirati:

- Visual Studio 2022 sa Service Fabric alatima i ASP.NET and web development workload
- .NET 8 SDK
- Microsoft Service Fabric SDK i Runtime
- Microsoft SQL Server 
- SQL Server Management Studio (SSMS)
- Node.js i npm 

# 1. Podešavanje baze podataka

Aplikacija koristi dve baze: TravelPlannerAuthDb za AuthService i TravelPlannerDb za TravelService.

# Kreiranje SQL korisnika

U SSMS, konektovan na localhost, pokrenuti:

CREATE LOGIN travelplanner WITH PASSWORD = 'NekaSifra';
ALTER SERVER ROLE sysadmin ADD MEMBER travelplanner;

# Pokretanje migracija

Migracije se pokreću kroz Package Manager Console u Visual Studiu.
Update-Database

# 2. Konfiguracija backend servisa

Svaki servis ima PackageRoot/Config/Settings.xml gde se podešavaju connection string-ovi, JWT podešavanja i URL frontenda.


# 3. Pokretanje backenda SF

Potrebno je da je startup project postavljen na TravelPlannerApp.
Zatim pritisnuti F5 za deploy servisa.
Stanje tatusa se prati na Service Fabric Explorer http://localhost:19080.

## 4. Pokretanje frontenda

Kreirati .env fajl u root-u /frontend foldera sa sadržajem:

   VITE_API_BASE_URL=http://localhost:5001
   VITE_TRAVEL_API_BASE_URL=http://localhost:5002
   VITE_GEOCODING_API_URL=https://nominatim.openstreetmap.org/search
   VITE_LEAFLET_CDN=https://unpkg.com/leaflet@1.9.4/dist
   VITE_OSM_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
   VITE_OSM_ATTRIBUTION_URL=https://www.openstreetmap.org/copyright
   VITE_QRCODE_CDN_URL=https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
   
Server se pokreće iz terminala sa npm run dev.

Aplikacija je se podiže na http://localhost:5173.
