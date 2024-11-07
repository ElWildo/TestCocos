import {
  _decorator,
  Button,
  Animation,
  Component,
  instantiate,
  Label,
  Node,
  Prefab,
  Sprite,
  Color,
  ProgressBar,
} from "cc";
import { HealthBar } from "./HealthBar";
const { ccclass, property } = _decorator;

export interface HeroStyle {
  fill?: number;
}

export interface HeroData {
  name: string;
  health: number;
  att_power: number;
  exp: number;
  lvl: number;
  selected?: boolean;
  unlocked?: boolean;
  style?: HeroStyle;
}

@ccclass("Hero")
export class Hero extends Component {
  public Hero_Name: string;
  public Hero_Health: number;
  public Hero_Att_Power: number;
  public Hero_Exp: number;
  public Hero_Level: number;
  @property(Node)
  infoDisplay: Node = null;
  @property(Node)
  selectedBackground: Node = null;
  @property(Prefab)
  infoLine: Prefab = null;
  private infoDisplayActive: boolean = false;
  public button: Button = null;
  private clicktimer = 0;
  private battleMode: Node = null;

  protected onLoad(): void {
    this.init();
  }

  start() {}

  init() {
    this.initButton();
    this.infoDisplay.active = false;
    this.battleMode = this.node.getChildByName("BattleMode");
  }

  initHero({ name, health, att_power, exp, lvl, style }: HeroData) {
    this.Hero_Name = name;
    this.Hero_Health = health;
    this.Hero_Att_Power = att_power;
    this.Hero_Exp = exp;
    this.Hero_Level = lvl;
    let newColor: Color = new Color();
    Color.fromHEX(newColor, style.fill);
    this.node.getChildByName("Body").getComponent(Sprite).color = newColor;
    this.initInfoDisplay();
  }

  initButton() {
    this.button = this.node.getChildByName("Button").getComponent(Button);
    this.button.node.on(Node.EventType.TOUCH_START, (event) => {
      this.infoDisplayActive = true;
    });
    this.button.node.on(Node.EventType.TOUCH_END, (event) => {
      this.infoDisplayActive = false;
      this.infoDisplay.active = false;
      this.clicktimer = 0;
    });
  }

  async initInfoDisplay() {
    const name = this.infoDisplay.getChildByName("Name");
    const health = this.infoDisplay.getChildByName("Health");
    const att_power = this.infoDisplay.getChildByName("Attack Power");
    const exp = this.infoDisplay.getChildByName("Experience");
    const lvl = this.infoDisplay.getChildByName("Level");
    name.getChildByName("InfoValue").getComponent(Label).string =
      this.Hero_Name;
    health.getChildByName("InfoValue").getComponent(Label).string =
      this.Hero_Health.toString();
    att_power.getChildByName("InfoValue").getComponent(Label).string =
      this.Hero_Att_Power.toString();
    exp.getChildByName("InfoValue").getComponent(Label).string =
      this.Hero_Exp.toString();
    lvl.getChildByName("InfoValue").getComponent(Label).string =
      this.Hero_Level.toString();
    health.position.set(name.position.x, name.position.y - 25, name.position.z);
    att_power.position.set(
      health.position.x,
      health.position.y - 25,
      health.position.z
    );
    exp.position.set(
      att_power.position.x,
      att_power.position.y - 25,
      att_power.position.z
    );
    lvl.position.set(exp.position.x, exp.position.y - 25, exp.position.z);
  }

  attack(target: Hero, callback: () => void) {
    target.battleMode
      .getChildByName("HealthBar")
      .getComponent(HealthBar)
      .updateHealth(this.Hero_Att_Power);
    const enemyDamageMessage =
      target.battleMode.getChildByName("DamageMessage");
    enemyDamageMessage
      .getChildByName("DamageReceived")
      .getComponent(Label).string = "-" + this.Hero_Att_Power;
    enemyDamageMessage.getComponent(Animation).play();
    const animations = this.node.getChildByName("Body").getComponent(Animation);
    animations.once(Animation.EventType.FINISHED, callback);
    this.node.parent.position.x < 0
      ? animations.play("AttackFromRight")
      : animations.play("AttackFromLeft");
  }

  healAll() {
    this.battleMode
      .getChildByName("HealthBar")
      .getComponent(HealthBar)
      .updateHealth(-this.Hero_Health);
  }

  isAlive() {
    return (
      this.battleMode.getChildByName("HealthBar").getComponent(ProgressBar)
        .progress < 1
    );
  }

  async addExpAnim(callback: () => void) {
    if (this.Hero_Exp + 1 >= 5) {
      const animations = this.battleMode
        .getChildByName("LevelUpMessages")
        .getComponent(Animation);
      animations.once(Animation.EventType.FINISHED, callback);
      animations.play();
    } else {
      const animations = this.node
        .getChildByName("Body")
        .getComponent(Animation);
      animations.once(Animation.EventType.FINISHED, callback);
      animations.play("Jump");
    }
  }

  update(deltaTime: number) {
    if (this.infoDisplayActive) {
      this.clicktimer += deltaTime;
      if (this.clicktimer >= 3) {
        this.infoDisplay.active = true;
      }
    }
  }
}
