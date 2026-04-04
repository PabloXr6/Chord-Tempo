"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ChordArticleForm = ({ article = null, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState([]);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      songId: article?.songId || '',
      content: article?.content || ''
    }
  });

  const songId = watch('songId');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const records = await pb.collection('songs').getFullList({ $autoCancel: false });
        setSongs(records);
      } catch (error) {
        console.error('Failed to fetch songs:', error);
      }
    };
    fetchSongs();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (article) {
        await pb.collection('chordArticles').update(article.id, data, { $autoCancel: false });
        toast({ title: 'Chord article updated successfully' });
      } else {
        await pb.collection('chordArticles').create(data, { $autoCancel: false });
        toast({ title: 'Chord article created successfully' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="songId">Song *</Label>
        <Select value={songId} onValueChange={(value) => setValue('songId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a song" />
          </SelectTrigger>
          <SelectContent>
            {songs.map((song) => (
              <SelectItem key={song.id} value={song.id}>
                {song.title} - {song.artist}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.songId && (
          <p className="text-sm text-destructive mt-1">{errors.songId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content">Chord Content *</Label>
        <Textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          placeholder="Enter lyrics with chord notations (e.g., [C]Amazing [G]grace)"
          rows={12}
          className="font-mono text-sm"
        />
        {errors.content && (
          <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Use [ChordName] to mark chords in the lyrics
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </form>
  );
};

export default ChordArticleForm;