# Example Snippets and Expected Outputs

These eight Processing snippets are **synthetic** — written by the authors for demonstration
and testing. They contain **no real student code**. They mirror the misconception
manifestations described in the catalog
(`server/src/misconception_catalog/misconception_catalog.json`) and in the accompanying
paper.

## How to use

Paste a snippet into the code editor of the running web application (see root README)
and click *Analyze*. The detected misconceptions are shown in the right-hand panel with
the relevant line numbers highlighted in the editor.

## Expected results

The reference output is the **set of detected misconception IDs** per snippet. Because
the system queries an LLM, explanations and exact line lists may vary slightly between
runs; the detected ID set should be stable.

| Snippet | Expected misconception ID(s) | Key lines | Rationale |
|---|---|---|---|
| `example_01_arrays_grow.pde` | `Arrays_Grow` | 7 | `scores[3] = 35;` writes beyond the last valid index of a length-3 array. |
| `example_02_array_length_as_number.pde` | `Array_Length_as_Number` | 1, 4 | Loop condition hardcodes `8` instead of using `data.length`. |
| `example_03_one_loop_per_array.pde` | `One_Loop_per_Array` | 6–11 | Two structurally aligned arrays (`position`, `speed`) of identical length are initialized in separate loops. |
| `example_04_loops_for_index_access.pde` | `Loops_for_Array_Index_Access` | 4–6 | A loop with `if (i == 3)` is used to access an element whose index is already known. |
| `example_05_multi_label.pde` | `Arrays_Always_Contain_Data`, `Array_Length_as_Number` | 1, 5, 6 | Elements of `balls` are accessed without being initialized (`null` references), and the loop hardcodes `5` instead of `balls.length`. |
| `example_06_no_misconception.pde` | *(none)* | — | Correct use of `.length` in the loop condition and direct access by known index. False-positive check: the result panel should report no misconceptions. |
| `example_07_multi_label_loops_hardcoded.pde` | `One_Loop_per_Array`, `Array_Length_as_Number` | 5–10 | Two related arrays of identical length (`highs`, `lows`) are filled in two separate loops, and both loop conditions hardcode `6` instead of using `.length`. |
| `example_08_multi_label_grow_index.pde` | `Arrays_Grow`, `Loops_for_Array_Index_Access` | 4, 5–9 | `values[3] = 16;` writes beyond the last valid index of a length-3 array, and a loop with `if (i == 1)` is used to access an element whose index is already known. |

## Console output (server)

For each analysis, the server logs the received code and the raw model response
(`findings` array with `id`, `lines`, `explanation`) before returning the parsed result
to the client.
