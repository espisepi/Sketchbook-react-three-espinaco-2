import { World } from "../World";
import { IUpdatable } from "../../interfaces/IUpdatable";
import { ProceduralTerrain } from "./ProceduralTerrain";

export class ProceduralTerrainWorld implements IUpdatable {
  public readonly updateOrder: number = 1;

  private readonly world: World;
  private readonly terrain: ProceduralTerrain;

  constructor(world: World) {
    this.world = world;
    this.terrain = new ProceduralTerrain(world);
    this.world.graphicsWorld.add(this.terrain.group);
    this.terrain.update();
    this.world.registerUpdatable(this);
  }

  public update(_timeStep: number, _unscaledTimeStep: number): void {
    this.terrain.update();
  }

  public dispose(): void {
    this.world.unregisterUpdatable(this);
    this.terrain.dispose();
  }
}