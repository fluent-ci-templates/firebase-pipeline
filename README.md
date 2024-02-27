# Firebase Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Ffirebase_pipeline&query=%24.version)](https://pkg.fluentci.io/firebase_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.37)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/firebase-pipeline)](https://codecov.io/gh/fluent-ci-templates/firebase-pipeline)

A ready-to-use CI/CD Pipeline for deploying your application to [firebase](https://firebase.google.com/) hosting.

## 🚀 Usage

Run the following command:

```bash
fluentci run firebase_pipeline
```

## Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger install github.com/fluent-ci-templates/firebase-pipeline@mod
```

## Environment Variables

| Variable       | Description                   |
|----------------|-------------------------------|
| FIREBASE_TOKEN | Your firebase Access Token    |


## Jobs

| Job         | Description                                                |
|-------------|------------------------------------------------------------|
| build       | Build your project.                                        |
| deploy      | Deploy to firebase hosting.                                |

```typescript
build(
  src: string | Directory | undefined = "."
): Promise<Directory | string>

deploy(
  src: string | Directory | undefined = ".",
  token?: string | Secret
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { deploy } from "https://pkg.fluentci.io/firebase_pipeline@v0.4.3/mod.ts";

await deploy(".");
```
