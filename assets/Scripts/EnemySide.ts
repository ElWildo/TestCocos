import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  ProgressBar,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
import { GameManager } from "./GameManager";
import { Hero, HeroData } from "./Hero";
import { BattleMode, TURN } from "./BattleMode";
import { HeroSide } from "./HeroSide";
const { ccclass, property } = _decorator;

@ccclass("EnemySide")
export class EnemySide extends Component {
  @property(Prefab)
  HeroPrefab: Prefab = null;
  @property(GameManager)
  gameManager: GameManager = null;
  @property(Node)
  battleModeNode: Node = null;
  @property(Node)
  heroesSide: Node = null;
  private enemy: HeroData = null;
  public battleMode: boolean = false;

  initEnemySide() {
    const enemyTemp =
      this.gameManager.herosListInGame[
        Math.floor(Math.random() * this.gameManager.herosListInGame.length)
      ];
    this.enemy = {
      name: "Enemy",
      health: enemyTemp.health,
      att_power: enemyTemp.att_power * 2.5,
      exp: enemyTemp.exp,
      lvl: enemyTemp.lvl,
      selected: enemyTemp.selected,
      unlocked: enemyTemp.unlocked,
      style: enemyTemp.style,
    };
    const enemyNode = instantiate(this.HeroPrefab);
    enemyNode.getComponent(Hero).initHero(this.enemy);
    enemyNode.getComponent(UITransform).setContentSize(200, 200);
    enemyNode
      .getChildByName("Body")
      .getComponent(UITransform)
      .setContentSize(200, 200);
    const enemyHealth = enemyNode
      .getChildByName("BattleMode")
      .getChildByName("HealthBar");
    enemyHealth.setPosition(
      enemyHealth.position.x,
      enemyHealth.position.y - 100,
      enemyHealth.position.z
    );
    enemyHealth.setScale(
      new Vec3(
        enemyHealth.scale.x * 5,
        enemyHealth.scale.y,
        enemyHealth.scale.z
      )
    );
    enemyNode
      .getChildByName("Button")
      .getComponent(UITransform)
      .setContentSize(200, 200);
    this.node.addChild(enemyNode);
  }

  addBattleButtons() {
    const enemyComponent = this.node.getChildByName("Hero").getComponent(Hero);
    enemyComponent.button.node.on(Node.EventType.TOUCH_END, () => {
      this.battleMode ? this.enemyAttack() : null;
    });
    enemyComponent.button.node.active = true;
  }

  enemyAttack() {
    const enemyComponent = this.node.getChildByName("Hero").getComponent(Hero);
    const randomName = this.heroesSide
      .getComponent(HeroSide)
      .getRandomTargetNameFromHeroes();
    const heroComponent = this.heroesSide.children
      .find((child) => child.getComponent(Hero).Hero_Name == randomName)
      .getComponent(Hero);
    this.battleMode = false;
    enemyComponent.attack(heroComponent, () => {
      this.battleMode = true;
      this.heroesSide.getComponent(HeroSide).isPartyAlive()
        ? this.battleModeNode.getComponent(BattleMode).passTurn(TURN.HEROES)
        : this.battleModeNode.getComponent(BattleMode).passTurn(TURN.END_LOSE);
    });
  }

  protected async onEnable(): Promise<void> {
    await this.initEnemySide();
    await this.addBattleButtons();
  }

  protected async onDisable(): Promise<void> {
    await this.node.destroyAllChildren();
    this.enemy = null;
    this.battleMode = false;
  }
}
