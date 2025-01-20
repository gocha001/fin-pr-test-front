export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectUserName = (state) => state.auth.user.name;
export const selectUserEmail = (state) => state.auth.user.email;
export const selectUserAvatar = (state) => state.auth.user.avatarURL;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectIsRefreshing = (state) => state.auth.isRefreshing;
export const selectUserLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectDesiredVolume = (state) => state.auth.user.desiredVolume;
export const selectIsResendEmail = (state) => state.auth.isResendVerify;
export const selectUserCount = (state) => state.auth.userCount;

