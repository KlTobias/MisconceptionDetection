int[] values = {4, 8, 15};

void setup() {
  values[3] = 16;
  for (int i = 0; i < values.length; i++) {
    if (i == 1) {
      println(values[i]);
    }
  }
}
