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

## Development Setup
Earth and Moon positions
This calculation can be replaced with SPICE.spkez() call and grabbing the state vector

Question for SPICE, is there a way to compute the rotation?  It could be expressed in the state vector

```
//Earth rotation and orbit
earthMesh.rotation.y = Date.now() * -0.001;
earthMesh.position.x = Math.sin( Date.now() * 0.001 ) * 219.15;
earthMesh.position.z = Math.cos( Date.now() * 0.001 ) * 219.15;

//Moon rotation and orbit
moonMesh.rotation.y = Date.now() * -0.001;
moonMesh.position.x = Math.sin( Date.now() * 0.001 ) * 219.15 + Math.cos( Date.now() * -0.007 ) * -10;
moonMesh.position.z = Math.cos( Date.now() * 0.001 ) * 219.15 + Math.sin( Date.now() * -0.007 ) * -10;
```