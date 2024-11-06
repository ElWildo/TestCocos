import { _decorator, Button, Component, Node, ProgressBar } from "cc";
import { Hero } from "./Hero";
const { ccclass, property } = _decorator;

@ccclass("HealthBar")
export class HealthBar extends Component {
  private damage: number = 0;
  @property(Node)
  hero: Node = null;
  start() {}

  updateHealth(damage: number) {
    this.damage += damage / this.hero.getComponent(Hero).Hero_Health;
    if (this.damage < 0) {
      this.damage = 0;
    }
    if (this.damage > 1) {
      this.damage = 1;
    }
    this.node.getComponent(ProgressBar).progress = this.damage;

    if (this.damage >= 1)
      this.hero.getComponent(Hero).button.node.active = false;
  }

  update(deltaTime: number) {}
}
