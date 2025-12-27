let editorPassword = process.env.EDITOR_PASSWORD || 'admin@#$%';

export function getEditorPassword() {
  return editorPassword;
}

export function setEditorPassword(newPwd: string) {
  editorPassword = newPwd;
}