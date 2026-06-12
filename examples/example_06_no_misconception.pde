int[] values = new int[20];

void setup() {
  for (int i = 0; i < values.length; i++) {
    values[i] = i * i;
  }
  println(values[10]);
}
