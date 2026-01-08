import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signupSchema, loginSchema } from "@/lib/validation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Heart,
  Users,
  Building2,
  Mail,
  Lock,
  User,
  Wallet,
  ArrowRight,
  Shield,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  Gift,
} from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref");
  
  const [activeTab, setActiveTab] = useState(referralCodeFromUrl ? "signup" : "login");
  const [userType, setUserType] = useState<"donor" | "volunteer" | "ngo">("donor");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/social");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/social");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t("auth.error"),
        description: t("auth.enterEmail"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      toast({
        title: t("auth.error"),
        description: t("auth.sendEmailError"),
        variant: "destructive",
      });
      return;
    }

    setResetEmailSent(true);
    toast({
      title: t("auth.emailSent"),
      description: t("auth.checkInbox"),
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setLoading(false);
      toast({
        title: t("auth.loginFailed"),
        description: t("auth.googleLoginFailed"),
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with zod
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({
        title: t("auth.validationError"),
        description: result.error.errors[0]?.message || t("auth.invalidData"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email.trim(),
      password: result.data.password,
    });

    setLoading(false);

    if (error) {
      let errorMessage = t("auth.loginError");
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = t("auth.invalidCredentials");
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = t("auth.confirmEmail");
      }
      toast({
        title: t("auth.loginFailed"),
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("auth.loginSuccess"),
      description: t("auth.welcomeBackMessage"),
    });
    navigate("/social");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with zod
    const result = signupSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      toast({
        title: t("auth.validationError"),
        description: result.error.errors[0]?.message || t("auth.invalidData"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email.trim(),
      password: result.data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: result.data.fullName,
          role: userType,
          referral_code: referralCodeFromUrl || undefined,
        },
      },
    });

    setLoading(false);

    if (error) {
      let errorMessage = t("auth.signupError");
      if (error.message.includes("User already registered")) {
        errorMessage = t("auth.emailInUse");
      } else if (error.message.includes("Password")) {
        errorMessage = t("auth.weakPassword");
      }
      toast({
        title: t("auth.signupFailed"),
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Check if email confirmation is required
    if (data?.user && !data.user.email_confirmed_at) {
      toast({
        title: t("auth.checkEmail"),
        description: t("auth.verificationSent"),
      });
      navigate(`/verify-email?email=${encodeURIComponent(result.data.email.trim())}`);
    } else {
      toast({
        title: t("auth.signupSuccess"),
        description: t("auth.welcomeToFUN"),
      });
      navigate("/social");
    }
  };

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(275_60%_30%_/_0.3),_transparent_50%)]" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-light">
              <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
              {t("auth.backToHome")}
            </Button>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 backdrop-blur-xl bg-card/95 luxury-border"
          >
            {/* Title */}
            <div className="text-center mb-6">
              <Badge variant="gold" className="mb-4">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {t("auth.joinFunCharity")}
              </Badge>
              <h1 className="font-display text-2xl font-bold mb-2">
                {activeTab === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "login"
                  ? t("auth.loginSubtitle")
                  : t("auth.signupSubtitle")}
              </p>
              
              {/* Referral Bonus Banner */}
              {referralCodeFromUrl && activeTab === "signup" && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Gift className="w-5 h-5" />
                    <span className="font-semibold">🎁 Bạn được tặng 50,000 Camly Coin khi đăng ký!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mã giới thiệu: <strong className="text-green-600">{referralCodeFromUrl}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* User Type Selection (for signup) */}
            {activeTab === "signup" && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground mb-3 block">
                  {t("auth.joinAsRole")}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "donor", icon: Heart, labelKey: "auth.donor" },
                    { type: "volunteer", icon: Users, labelKey: "auth.volunteer" },
                    { type: "ngo", icon: Building2, labelKey: "auth.organization" },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => setUserType(option.type as typeof userType)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          userType === option.type
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1 ${
                            userType === option.type ? "text-secondary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            userType === option.type ? "text-secondary font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {t(option.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Auth Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6 bg-muted/50">
                <TabsTrigger value="login" className="flex-1">
                  {t("auth.login")}
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  {t("auth.signup")}
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                {forgotPasswordMode ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">{t("auth.forgotPasswordTitle")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {resetEmailSent 
                          ? t("auth.resetEmailSent")
                          : t("auth.enterEmailForReset")}
                      </p>
                    </div>
                    
                    {!resetEmailSent && (
                      <>
                        <div>
                          <Label htmlFor="reset-email">{t("auth.email")}</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="reset-email"
                              type="email"
                              name="reset-email"
                              autoComplete="email"
                              placeholder="email@example.com"
                              className="pl-10"
                              value={email}
                              onChange={(e) => setEmail(e.target.value.trim())}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t("auth.sending")}
                            </>
                          ) : (
                            <>
                              {t("auth.sendResetLink")}
                              <Mail className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => {
                        setForgotPasswordMode(false);
                        setResetEmailSent(false);
                      }}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
                      {t("auth.backToLogin")}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">{t("auth.email")}</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="email@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">{t("auth.password")}</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordMode(true)}
                        className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                      >
                        {t("auth.forgotPassword")}
                      </button>
                    </div>

                    <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("auth.processing")}
                        </>
                      ) : (
                        <>
                          {t("auth.login")}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {userType === "ngo" ? t("auth.organizationName") : t("auth.fullName")}
                    </Label>
                    <div className="relative mt-1">
                      {userType === "ngo" ? (
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      ) : (
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      )}
                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        placeholder={userType === "ngo" ? t("auth.orgPlaceholder") : t("auth.namePlaceholder")}
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">{t("auth.email")}</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        name="signup-email"
                        autoComplete="email"
                        placeholder="email@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">{t("auth.password")}</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        name="signup-password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={password} />
                  </div>

                  {userType === "ngo" && (
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium">{t("auth.kycRequirement")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("auth.kycDescription")}
                      </p>
                    </div>
                  )}

                  <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("auth.processing")}
                      </>
                    ) : (
                      <>
                        {t("auth.createAccount")}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t("auth.orContinueWith")}</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button 
              variant="outline" 
              className="w-full bg-white hover:bg-gray-50 text-[#4285F4] border-gray-300 font-medium"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("auth.loginWithGoogle")}
            </Button>

            {/* Wallet Connect */}
            <Button variant="wallet" className="w-full mt-3">
              <Wallet className="w-4 h-4" />
              {t("auth.connectWallet")}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {t("auth.walletSupport")}
            </p>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-6 text-primary-foreground/60 text-sm"
          >
            <p>{t("auth.tagline")}</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Auth;
