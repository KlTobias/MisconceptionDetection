PVector[] position = new PVector[10];
PVector[] speed = new PVector[10];

void setup() {
  size(400, 400);
  for (int i = 0; i < position.length; i++) {
    position[i] = new PVector(random(width), random(height));
  }
  for (int i = 0; i < speed.length; i++) {
    speed[i] = new PVector(random(-5, 5), random(-5, 5));
  }
}
