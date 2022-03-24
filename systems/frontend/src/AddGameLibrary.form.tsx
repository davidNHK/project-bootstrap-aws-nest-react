import { gql, useMutation } from '@apollo/client';
import DatePicker from '@mui/lab/DatePicker';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PropsWithoutRef, useCallback } from 'react';
import {
  Control,
  Controller,
  SubmitHandler,
  useController,
  useForm,
} from 'react-hook-form';

interface AddGameFormInput {
  boxArtImageUrl: string;
  genre: string;
  name: string;
  numberOfPlayers: string;
  platform: string;
  publisher: string;
  releaseDate: string | null;
}

const ADD_GAME_TO_LIST = gql`
  mutation addGameToLibrary($data: AddGameToLibraryArgs!) {
    addGameToLibrary(data: $data) {
      id
    }
  }
`;

const UPLOAD_BOX_ART = gql`
  mutation uploadBoxArt($file: Upload!) {
    uploadBoxArt(file: $file) {
      id
      url
    }
  }
`;

function GameBoxArtUploadField({
  control,
  disabled = false,
}: PropsWithoutRef<{
  control: Control<AddGameFormInput>;
  disabled?: boolean;
}>) {
  const [uploadBoxArt] = useMutation(UPLOAD_BOX_ART);
  const {
    field: { name, onBlur, onChange, ref, value },
    fieldState: { error },
  } = useController({
    control: control,
    name: 'boxArtImageUrl',
    rules: {
      required: { message: 'box art must be provided', value: true },
    },
  });

  const handleFileUpload = useCallback(
    async event => {
      const [sourceFile] = event.target.files;
      const { data, errors } = await uploadBoxArt({
        variables: { file: sourceFile },
      });
      if (errors) return;
      onChange(data.uploadBoxArt.url);
    },
    [uploadBoxArt, onChange],
  );

  const hasError = !!error;

  return (
    <FormControl error={hasError} fullWidth>
      {value && (
        <Box
          component={'img'}
          src={value}
          sx={{ height: '36rem', mb: 1, objectFit: 'contain' }}
        />
      )}
      {!disabled && (
        <label htmlFor="boxArt">
          <input
            accept="image/*"
            data-testid={'game-box-art-upload-input'}
            id="boxArt"
            name={name}
            onBlur={onBlur}
            onChange={handleFileUpload}
            ref={ref}
            style={{ display: 'none' }}
            type="file"
          />
          <Button
            color="secondary"
            component="span"
            sx={{ width: 1 }}
            variant="contained"
          >
            Upload Box Art{value && ' Again'}
          </Button>
        </label>
      )}
      {hasError && (
        <FormHelperText data-testid={'game-box-art-upload-error'}>
          {error.message}
        </FormHelperText>
      )}
    </FormControl>
  );
}

function GameReleaseDateField({
  control,
  disabled = false,
}: PropsWithoutRef<{
  control: Control<AddGameFormInput>;
  disabled?: boolean;
}>) {
  const {
    field: { name, onBlur, onChange, ref, value },
  } = useController({
    control: control,
    defaultValue: null,
    name: 'releaseDate',
  });
  return (
    <DatePicker
      disabled={disabled}
      label="Release Date"
      onChange={value => {
        onChange(value?.toString());
      }}
      renderInput={params => (
        <TextField
          {...params}
          data-testid={'release-date-input'}
          name={name}
          onBlur={onBlur}
          ref={ref}
        />
      )}
      value={value}
    />
  );
}

function GameNumberOfPlayersField({
  control,
  disabled = false,
}: PropsWithoutRef<{
  control: Control<AddGameFormInput>;
  disabled?: boolean;
}>) {
  const {
    field: { name, onBlur, onChange, ref, value },
    fieldState: { error },
  } = useController({
    control: control,
    name: 'numberOfPlayers',
    rules: {
      min: {
        message: "number of players can't less than 0",
        value: 0,
      },
    },
  });

  const onValueChange = useCallback(
    event => onChange(parseInt(event.target.value, 10)),
    [onChange],
  );

  const hasError = !!error;

  return (
    <FormControl error={hasError} fullWidth>
      <InputLabel htmlFor="numberOfPlayers">Number of players</InputLabel>
      <Input
        aria-describedby="number-of-players-error"
        data-testid={'number-of-players-input'}
        disabled={disabled}
        id="numberOfPlayers"
        inputProps={{ type: 'number' }}
        name={name}
        onBlur={onBlur}
        onChange={onValueChange}
        ref={ref}
        value={value}
      />
      {hasError && (
        <FormHelperText data-testid={'number-of-players-error'}>
          {error.message}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default function AddGameLibraryForm() {
  const { control, handleSubmit } = useForm<AddGameFormInput>({
    defaultValues: {},
    mode: 'onBlur',
  });
  const [createGameMutation, { data }] = useMutation(ADD_GAME_TO_LIST);
  const onSubmit: SubmitHandler<AddGameFormInput> = useCallback(
    async data => {
      await createGameMutation({
        variables: {
          data: {
            ...data,
            userId: '1ec57d7a-67be-42d0-8a97-07e743e6efbc',
          },
        },
      });
    },
    [createGameMutation],
  );
  return (
    <Container fixed sx={{ p: 2 }}>
      <Typography data-testid={'created-game-id'} sx={{ display: 'hidden' }}>
        {data?.addGameToLibrary.id}
      </Typography>
      <Stack
        component={'form'}
        data-testid={'add-game-form'}
        onSubmit={handleSubmit(onSubmit)}
        spacing={2}
      >
        <GameBoxArtUploadField control={control} />

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel htmlFor="name">Name</InputLabel>
              <Input data-testid={'game-name-input'} id="name" {...field} />
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="publisher"
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel htmlFor="publisher">Publisher</InputLabel>
              <Input
                data-testid={'game-publisher-input'}
                id="publisher"
                {...field}
              />
            </FormControl>
          )}
        />

        <Controller
          control={control}
          defaultValue={'PS5'}
          name={'platform'}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="platform-input-label">Platform</InputLabel>
              <Select
                data-testid={'game-platform-input'}
                id="platform-input-id"
                label="Platform"
                labelId="platform-input-label"
                {...field}
              >
                <MenuItem data-testid={'game-platform-input-ps4'} value={'PS4'}>
                  PS4
                </MenuItem>
                <MenuItem data-testid={'game-platform-input-ps5'} value={'PS5'}>
                  PS5
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <GameNumberOfPlayersField control={control} />

        <Controller
          control={control}
          defaultValue={'FIGHTING'}
          name={'genre'}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="genre-input-label">Genre</InputLabel>
              <Select
                data-testid={'genre-input'}
                id="genre-input-id"
                label="Genre"
                labelId="genre-input-label"
                {...field}
              >
                <MenuItem
                  data-testid={'genre-input-ps4-fighting'}
                  value={'FIGHTING'}
                >
                  Fighting
                </MenuItem>
                <MenuItem data-testid={'genre-input-ps5'} value={'FPS'}>
                  FPS
                </MenuItem>
                <MenuItem data-testid={'genre-input-rpg'} value={'RPG'}>
                  RPG
                </MenuItem>
                <MenuItem data-testid={'genre-input-srpg'} value={'SRPG'}>
                  SRPG
                </MenuItem>
                <MenuItem data-testid={'genre-input-action'} value={'ACTION'}>
                  Action
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <GameReleaseDateField control={control} />
        <Button
          data-testid={'submit-add-new-game-form'}
          type={'submit'}
          variant="contained"
        >
          Submit
        </Button>
      </Stack>
    </Container>
  );
}
