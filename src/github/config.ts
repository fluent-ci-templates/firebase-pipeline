import { JobSpec, Workflow } from "fluent_github_actions";

export function generateYaml(): Workflow {
  const workflow = new Workflow("deploy");

  const push = {
    branches: ["main"],
  };

  const tests: JobSpec = {
    "runs-on": "ubuntu-latest",
    steps: [
      {
        uses: "actions/checkout@v3",
      },
      {
        name: "Setup Fluent CI",
        run: "fluentci-io/setup-fluentci@v1",
      },
      {
        name: "Run Dagger Pipelines",
        run: "fluentci run firebase_pipeline deploy",
        env: {
          FIREBASE_TOKEN: "${{ secrets.FIREBASE_TOKEN }}",
        },
      },
    ],
  };

  workflow.on({ push }).jobs({ tests });

  return workflow;
}
