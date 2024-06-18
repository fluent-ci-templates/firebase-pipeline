# Firebase Pipeline

[![fluentci pipeline](https://shield.fluentci.io/x/firebase_pipeline)](https://pkg.fluentci.io/firebase_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.41)
[![dagger-min-version](https://shield.fluentci.io/dagger/v0.11.7)](https://dagger.io)
[![](https://jsr.io/badges/@fluentci/firebase)](https://jsr.io/@fluentci/firebase)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/firebase-pipeline)](https://codecov.io/gh/fluent-ci-templates/firebase-pipeline)
[![ci](https://github.com/fluent-ci-templates/firebase-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/fluent-ci-templates/firebase-pipeline/actions/workflows/ci.yml)

A ready-to-use CI/CD Pipeline for deploying your application to [firebase](https://firebase.google.com/) hosting.

## 🚀 Usage

Run the following command:

```bash
fluentci run firebase_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t firebase
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

Or simply:

```bash
fluentci
```

## 🧩 Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger install github.com/fluent-ci-templates/firebase-pipeline@main
```

Call a function from the module:

```bash
dagger call build --src .
dagger call deploy --src . --token env:FIREBASE_TOKEN
```

## 🛠️ Environment Variables

| Variable       | Description                   |
|----------------|-------------------------------|
| FIREBASE_TOKEN | Your firebase Access Token    |

## ✨ Jobs

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

## 👨‍💻 Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { deploy } from "jsr:@fluentci/firebase";

await deploy(".");
```
