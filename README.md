# threejs-orbits

Reading up on threejs and drawing planet orbits:

https://stackoverflow.com/questions/29744233/animating-planet-orbiting-its-parent-idependent-on-parents-rotation-state

### Build
```
docker build -t orbits .
```

### Run
```
docker run -d -v ${PWD}:/app -v /app/node_modules -p 8081:3000 --name orb --rm orbits
```