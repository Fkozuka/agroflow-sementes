
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wheat, Lock, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Nome de usuário deve ter pelo menos 3 caracteres.",
  }),
  password: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Adicione esta lista de usuários no início do componente (antes do handleSubmit)
  const users = [
    { username: "admin", password: "admin123" },
    { username: "585696", password: "585696" },
    { username: "569856", password: "569856" },
    { username: "809755", password: "809755" },
    { username: "508717", password: "508717" },
    { username: "812901", password: "812901" },
    { username: "810321", password: "810321" },
    { username: "573918", password: "573918" },
    { username: "591938", password: "591938" },
    { username: "570135", password: "570135" },
    { username: "523262", password: "523262" },
    { username: "588017", password: "588017" }, // JEAN 
    // Adicione mais usuários conforme necessário
  ];

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Substitua o trecho de validação do login por este:
    const userFound = users.find(
      (user) => user.username === values.username && user.password === values.password
    );

    if (userFound) {
      // Salva o estado de autenticação (em um app real, armazene um token)
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userName", values.username);

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao AgroFlow Sementes!",
      });
      
      navigate("/");
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha inválidos.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-industrial-primary p-4 rounded-full">
            <Wheat size={32} className="text-industrial-warning" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-industrial-primary mb-6">
          AgroFlow Sementes
        </h1>
        <h2 className="text-xl text-center text-gray-600 mb-8">
          Sistema de Gestão de Sementes
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Digite seu nome de usuário"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="w-full bg-industrial-primary hover:bg-industrial-primary/90"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>AgroFlow Sementes</p>
          <p>Sistema de Gestão de Sementes</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
