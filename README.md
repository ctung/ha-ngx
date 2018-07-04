# ha-ngx Home Assistant Mobile Front-End  

A mobile-first front-end for home automation control, using the [Home Assistant](https://www.home-assistant.io/) ecosystem.  Most of the currently available control panels for Home Assistant are targeted for tablets.  Considering an average home probably has at least 10-15 light switches, trying to show all those buttons on a phone would get out of hand.  

So I chose a functional approach for a solution; my philosophy is that the majority of time, you will be only interested in the controls for the room you currently inhabit.  So instead of showing everything at once, allw the user to select the room they are in, and then present only the controls for that room.  That helps cut down the number of buttons, as well as clusters all the associated controls closely together.

The main Dashboard consists of 2 parts
* The control panel that holds the buttons
* a floorplan map that slides out from the left (Material Drawer) when the user clicks the home icon
* when the user clicks on a room on the floorplan, the drawer slides away, and reveals the control panel for the newly selected room

Lastly, to support complex controls, like dimmers, I created a "click-and-drag" button, that has all the functionality of a slider, while consuming the screen real estate of a button.  Drag the button down, and the distance dragged works like a slider.  Drag the button up and set the value to zero.

## This is still a WIP

This code is incomplete.  At this time, I only have a light switch as the only working component.  The components are modular, so as I get access to more devices, I will add more components.  If you use this for more than lights, be aware that you may need to write your own component to control that device.  The code is modular, so the light switch should serve as a good template for anything you need to add.

To add more entity types:
* Create a new component similar to `./src/apps/light/light.component.ts`
  * @Input should be the entity_id of the device
  * Subscribe to hassService.states for state change updates
  * Use hassService.call() to make calls to HA
  * I think it's appropriate here to unsubscribe when the component is destroyed
* In `./src/apps/panel/panel.component.ts`:
```typescript
getEntityIds(group: string, states: any[]): any {
    // console.log(states);
    const entity = states.find(x => x.entity_id === group);
    if (entity) {
      this.light_ids = entity.attributes.entity_id.filter((x: string) => x.startsWith('light.'));
      // add more component types here
      // this.component_type_ids = entity.attributes_id.filter((x:string) => x.startsWith('component_type'));
    }
  }
```
* In `./src/apps/panel/panel.component.html` add a new `<div *ngIf="..."></div>` section for your entity type
* Add your new component to your new div
```typescript
getEntityIds(group: string, states: any[]): any {
    // console.log(states);
    const entity = states.find(x => x.entity_id === group);
    if (entity) {
      this.light_ids = entity.attributes.entity_id.filter((x: string) => x.startsWith('light.'));
      // add more component types here
      // this.component_type_ids = entity.attributes_id.filter((x:string) => x.startsWith('component_type'));

    }
  }
```

## Getting started

Install [Angular CLI](https://github.com/angular/angular-cli) if you don't already have it. I recommend [MS Visual Studio](https://visualstudio.microsoft.com/vs/) for code edits

* Run `git clone https://github.com/ctung/cape-automation.git` to grab a copy of the code
* `cd cape-automation`
* Run `npm update` to grab all the necessary modules
* Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
* When You're happy with your changes, run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.  
* Copy the files in `dist/` to your webserver

If you want to make this app accessible from the internet, you will also need to open your websocket port (default 8123), as the app will attempt to make a websocket connection directly to your HA instance. **Be sure to select a strong api_password**

## Home Assistant Configuration

This web app reads your home assistant groups to collect information about your rooms, and uses the group names to associate rooms with the layer names in the floorplan SVG.

* Each Room should have it's own group, where the group name must match a layer name in your floorplan SVG
* Each Room should have a list of entities for that room.
* Each entity should have a friendly_name that can identity it eg "Kitchen Light"

```yaml
  default_view:
    view: yes
    icon: mdi:home
    entities:
      - group.main
      - group.hall
      - group.family
      - group.master_bed
      - group.bed1
      - group.bed2

  main:
    name: Main Room
    entities:
      - light.ge_unknown_type5044_id3038_level

  hall:
    name: Hallway
    entities:

  family:
    name: Family Room
    entities:

  master_bed:
    name: Master Bedroom
    entities:

  bed1:
    name: Bedroom 1
    entities:

  bed2:
    name: Bedroom 2
    entities:
```

## Floorplan SVG

The floorplans must be drawn with Inkscape with one layer group per room
* Each Layer group must be named identical to the room group names in the groups.yaml
* See [./src/assets/fplan.svg](https://github.com/ctung/cape-automation/blob/master/src/assets/fplan.svg) as an example
```html
 <g
     inkscape:groupmode="layer"
     id="layer12"
     inkscape:label="master_bed"
     transform="translate(-31.317499,-62.411241)"
     style="display:inline">
     ...
 </g>
  ```
## Code Flow

1. Open a websocket to the HA websocket api (`websocket.service.ts`)
2. Subscribe to the websocket with a handler for authentication (`./login/auth.service.ts`)
3. Send get_* calls to the websocket api to read the current state, and provide that state to the web app as a BehaviorSubject Observable (`hass.service.ts`)
4. Subscribe to the websocket for state_changed events.  Each time a state_changed event occurs, update the local state, and emit the new state on the state observable (`hass.service.ts`)
5. Subscribe the map to the states observable.  For every SVG layer that matches a hass state group name, a (click) handler is added to the SVG layer, that updates the selected room. (`./map/map.component.ts`)
6. When a room is selected, the updateControls function grabs the entity_ids for the hass state group associated with that room (`./panel/panel.component.ts`)
7. If the room has light groups, then render material card for the lights, and a light button component for each light group (`./panel/panel.component.html`)
8. The light button components monitor for drag events, sending a call to the HA websocket to change the light state.  The light button component also subscribes to the states observable, so if the brightness is non-zero, the button changes color to yellow. (`./light/light.component.ts`)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
