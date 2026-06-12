PVector[] balls = new PVector[5];

void setup() {
  size(400, 400);
  for (int i = 0; i < 5; i++) {
    ellipse(balls[i].x, balls[i].y, 10, 10);
  }
}
