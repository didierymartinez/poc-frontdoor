#!/bin/bash
# Validates that .tsx files don't have more than 2 React component definitions.
# A React component is a function that starts with an uppercase letter AND returns JSX.
# Helper functions (formatCurrency, getColumns, resolveMoneda, etc.) are NOT counted.

# Allow 1 main export + up to 3 small private helpers (cell renderers, sub-tables, etc.)
MAX_COMPONENTS=4
EXIT_CODE=0

while IFS= read -r file; do
  # Count functions/consts starting with uppercase that contain "return (" or "=> ("
  # which indicates they return JSX — this filters out pure helper functions
  count=0
  in_function=false
  func_name=""

  while IFS= read -r line; do
    # Detect function/const starting with uppercase (potential component)
    if echo "$line" | grep -qE "^(export )?(function|const) [A-Z]"; then
      in_function=true
      func_name=$(echo "$line" | grep -oE "(function|const) [A-Z][a-zA-Z]*" | awk '{print $2}')
    fi

    # If inside a potential component, check for JSX return
    if [ "$in_function" = true ]; then
      if echo "$line" | grep -qE "return \(|=> \(|=> <"; then
        count=$((count + 1))
        in_function=false
      fi
      # Reset if we hit another function definition without finding return
      if echo "$line" | grep -qE "^(export )?(function|const) [A-Z]" && [ "$func_name" != "$(echo "$line" | grep -oE "(function|const) [A-Z][a-zA-Z]*" | awk '{print $2}')" ]; then
        in_function=true
        func_name=$(echo "$line" | grep -oE "(function|const) [A-Z][a-zA-Z]*" | awk '{print $2}')
      fi
    fi
  done < "$file"

  if [ "$count" -gt "$MAX_COMPONENTS" ]; then
    echo "⚠️  $file has $count components (max $MAX_COMPONENTS)"
    EXIT_CODE=1
  fi
done < <(find src -name "*.tsx" -not -path "*/node_modules/*")

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ All files have $MAX_COMPONENTS or fewer components"
fi

exit $EXIT_CODE
